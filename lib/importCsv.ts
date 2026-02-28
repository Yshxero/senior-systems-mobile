/**
 * importCsv.ts
 *
 * Reads a CSV file chosen by the user and inserts the parsed records
 * into the local SQLite database.
 *
 * Supports TWO birthday column formats:
 *   1. Combined: "Birthday" column → "February 7, 1957" or "Feb 7, 1957"
 *   2. Separate: "Birthday Month" + "Birthday Day" + "Birthday Year" columns
 *
 * The ID and Date Added columns are ignored — new IDs are auto-generated on insert.
 */

import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite';
import { insertSenior, seniorExists, resetSeniorSequence, NewSeniorRecord } from './database';

// Supports both full names and abbreviations, case-insensitive
const MONTH_MAP: Record<string, string> = {
    // Short names
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12',
    // Full names
    january: '01', february: '02', march: '03', april: '04',
    june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
};

/**
 * Parse a birthday string like "February 7, 1957" or "Feb 7, 1957"
 * into { month, day, year }.
 * Handles commas, extra spaces, and both full/short month names.
 */
function parseBirthday(raw: string): { month: string; day: string; year: string } {
    const parts = raw.trim().split(/[\s,]+/).filter(Boolean);
    const month = MONTH_MAP[parts[0]?.toLowerCase()] ?? '01';
    const day = String(parseInt(parts[1] ?? '1', 10) || 1).padStart(2, '0');
    const year = parts[2] ?? '2000';

    return { month, day, year };
}

/** Unquote a CSV field that may be wrapped in double quotes. */
function unquote(field: string): string {
    const s = field.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
        return s.slice(1, -1).replace(/""/g, '"');
    }
    return s;
}

/**
 * Split a single CSV line into fields, respecting quoted fields.
 * Handles commas inside quoted strings correctly.
 */
function splitCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

export interface ImportResult {
    imported: number;
    duplicates: number;
    skipped: number;
    errors: string[];
}

/**
 * Let the user pick a CSV file, parse it, and insert all valid rows
 * into the SQLite database.
 *
 * @returns ImportResult with counts of imported/skipped rows and any error messages
 */
export async function importRecordsFromCsv(db: SQLiteDatabase): Promise<ImportResult | null> {
    // Open system file picker
    const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/csv', '*/*'],
        copyToCacheDirectory: true,
    });

    // User cancelled
    if (result.canceled) return null;

    const asset = result.assets?.[0];
    if (!asset?.uri) return null;

    // Read the file using the SDK 54 File API
    const file = new ExpoFile(asset.uri);
    const rawText: string = await file.text();

    // Reset sequence if table is empty so IDs start from 1
    await resetSeniorSequence(db);

    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);

    if (lines.length < 2) {
        return { imported: 0, duplicates: 0, skipped: 0, errors: ['File is empty or has no data rows.'] };
    }

    // Parse header row — normalize to lowercase with underscores
    const rawHeaders = splitCsvLine(lines[0]);
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[\s]+/g, '_'));

    /** Find first header index that EXACTLY matches a keyword */
    const exactCol = (keyword: string) =>
        headers.findIndex(h => h === keyword);

    /** Find first header index that CONTAINS a keyword */
    const colContains = (keyword: string) =>
        headers.findIndex(h => h.includes(keyword));

    const idxLastName = colContains('last');
    const idxFirstName = colContains('first');
    const idxMiddleName = colContains('middle');
    const idxExtName = colContains('ext');

    // Birthday: prefer EXACT "birthday" column (combined format).
    // Fall back to separate birthday_month / birthday_day / birthday_year columns.
    const idxBirthday = exactCol('birthday');
    const idxBirthdayMonth = colContains('birthday_month');
    const idxBirthdayDay = colContains('birthday_day');
    const idxBirthdayYear = colContains('birthday_year');

    const idxSex = colContains('sex');
    const idxCivilStatus = colContains('civil');
    const idxPhone = colContains('cellphone');
    const idxNationalId = colContains('national');
    const idxOccupation = colContains('occupation');
    const idxPension = colContains('pension');

    // Require at minimum last name + first name
    if (idxLastName === -1 || idxFirstName === -1) {
        return {
            imported: 0,
            duplicates: 0,
            skipped: 0,
            errors: ['CSV is missing required columns: "Last Name" and/or "First Name".'],
        };
    }

    const importResult: ImportResult = { imported: 0, duplicates: 0, skipped: 0, errors: [] };

    for (let i = 1; i < lines.length; i++) {
        const fields = splitCsvLine(lines[i]);
        const get = (idx: number) => idx >= 0 ? unquote(fields[idx] ?? '') : '';

        const lastName = get(idxLastName);
        const firstName = get(idxFirstName);

        // Skip rows missing required names
        if (!lastName || !firstName) {
            importResult.skipped++;
            continue;
        }

        // ── Birthday resolution ────────────────────────────────────────────
        let month = '01', day = '01', year = '2000';

        if (idxBirthday >= 0) {
            // Combined column: "February 7, 1957"
            const raw = get(idxBirthday);
            if (raw) ({ month, day, year } = parseBirthday(raw));
        } else if (idxBirthdayMonth >= 0) {
            // Separate columns: month may be "01" or "January" or "01 - January"
            const rawMonth = get(idxBirthdayMonth).split(/[\s\-]+/)[0]; // take first token
            month = MONTH_MAP[rawMonth.toLowerCase()] ?? rawMonth.padStart(2, '0');
            day = String(parseInt(get(idxBirthdayDay) || '1', 10) || 1).padStart(2, '0');
            year = get(idxBirthdayYear) || '2000';
        }

        const record: NewSeniorRecord = {
            last_name: lastName,
            first_name: firstName,
            middle_name: get(idxMiddleName),
            ext_name: get(idxExtName),
            birthday_month: month,
            birthday_day: day,
            birthday_year: year,
            sex: get(idxSex) || 'N/A',
            civil_status: get(idxCivilStatus) || 'N/A',
            cellphone_number: get(idxPhone) || 'N/A',
            national_id: get(idxNationalId) || 'N/A',
            occupation: get(idxOccupation) || '',
            pension: get(idxPension) || 'N/A',
        };

        try {
            // Skip if a record with the same name already exists
            const duplicate = await seniorExists(db, firstName, lastName);
            if (duplicate) {
                importResult.duplicates++;
                continue;
            }

            await insertSenior(db, record);
            importResult.imported++;
        } catch (e: any) {
            importResult.errors.push(`Row ${i}: ${e?.message ?? 'insert failed'}`);
            importResult.skipped++;
        }
    }

    return importResult;
}

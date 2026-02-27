/**
 * exportCsv.ts
 *
 * Generates a CSV file from senior citizen records and shares it with the user.
 * Uses expo-file-system (SDK 54 File/Paths API) to write the file
 * and expo-sharing to open the share dialog.
 *
 * Records are exported in alphabetical order (A–Z by last name, handled by DB).
 */

import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SeniorRecord } from './database';

/**
 * Escape a CSV field value.
 * Wraps in double quotes if the value contains commas, quotes, or newlines.
 */
function escapeCsvField(value: string): string {
    const str = value ?? '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/** Convert numeric month ("01") to short month name ("Jan"). */
function monthName(month: string): string {
    const NAMES = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const index = Math.max(0, Math.min(11, Number(month) - 1));
    return NAMES[index] || month;
}

/**
 * Convert an array of SeniorRecord objects into a CSV string.
 * Records should already be sorted alphabetically by the DB query.
 */
function recordsToCsv(records: SeniorRecord[]): string {
    const headers = [
        'ID',
        'Last Name',
        'First Name',
        'Middle Name',
        'Ext Name',
        'Birthday',
        'Sex',
        'Civil Status',
        'Cellphone Number',
        'National ID',
        'Occupation',
        'Pension',
        'Date Added',
    ];

    const csvLines: string[] = [headers.join(',')];

    for (const record of records) {
        const birthday = `${monthName(record.birthday_month)} ${record.birthday_day}, ${record.birthday_year}`;
        const row = [
            String(record.id),
            escapeCsvField(record.last_name),
            escapeCsvField(record.first_name),
            escapeCsvField(record.middle_name),
            escapeCsvField(record.ext_name),
            escapeCsvField(birthday),
            record.sex,
            escapeCsvField(record.civil_status),
            escapeCsvField(record.cellphone_number),
            escapeCsvField(record.national_id),
            escapeCsvField(record.occupation),
            escapeCsvField(record.pension || 'N/A'),
            record.created_at,
        ];
        csvLines.push(row.join(','));
    }

    return csvLines.join('\n');
}

/**
 * Export senior records as a CSV file and open the system share dialog.
 * Records are exported A–Z by last name (order from DB query).
 */
export async function exportRecordsToCsv(records: SeniorRecord[]): Promise<void> {
    if (!records.length) {
        throw new Error('No records to export.');
    }

    const csvContent = recordsToCsv(records);

    // Create a unique filename with timestamp
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `senior_records_${timestamp}.csv`;

    // Create and write the CSV file using the SDK 54 File API
    const csvFile = new ExpoFile(Paths.cache, fileName);
    if (csvFile.exists) {
        csvFile.delete();
    }
    csvFile.create();
    csvFile.write(csvContent);

    // Check sharing support
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Sharing is not available on this device.');
    }

    // Open system share sheet
    await Sharing.shareAsync(csvFile.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Senior Records',
        UTI: 'public.comma-separated-values-text',
    });
}

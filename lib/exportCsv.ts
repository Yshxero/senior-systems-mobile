import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SeniorRecord } from './database';

function escapeCsvField(value: string): string {
    const str = value ?? '';
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function monthName(month: string): string {
    const NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const index = Math.max(0, Math.min(11, Number(month) - 1));
    return NAMES[index] || month;
}

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

export async function exportRecordsToCsv(records: SeniorRecord[]): Promise<void> {
    if (!records.length) {
        throw new Error('No records to export.');
    }

    const csvContent = recordsToCsv(records);

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `senior_records_${timestamp}.csv`;

    const csvFile = new ExpoFile(Paths.cache, fileName);
    if (csvFile.exists) {
        csvFile.delete();
    }
    csvFile.create();
    csvFile.write(csvContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Sharing is not available on this device.');
    }

    await Sharing.shareAsync(csvFile.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Senior Records',
        UTI: 'public.comma-separated-values-text',
    });
}

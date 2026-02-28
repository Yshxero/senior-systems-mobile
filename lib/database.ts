import * as SQLite from 'expo-sqlite';

export interface SeniorRecord {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    ext_name: string;
    birthday_month: string;
    birthday_day: string;
    birthday_year: string;
    sex: string;
    civil_status: string;
    cellphone_number: string;
    national_id: string;
    occupation: string;
    pension: string;
    created_at: string;
}

export type NewSeniorRecord = Omit<SeniorRecord, 'id' | 'created_at'>;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync('seniors.db');

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS seniors (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name       TEXT NOT NULL,
      first_name      TEXT NOT NULL,
      middle_name     TEXT DEFAULT '',
      ext_name        TEXT DEFAULT '',
      birthday_month  TEXT NOT NULL,
      birthday_day    TEXT NOT NULL,
      birthday_year   TEXT NOT NULL,
      sex             TEXT NOT NULL,
      civil_status    TEXT NOT NULL,
      cellphone_number TEXT DEFAULT '',
      national_id     TEXT DEFAULT '',
      occupation      TEXT DEFAULT '',
      pension         TEXT DEFAULT '',
      created_at      TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

    try {
        await db.execAsync(`ALTER TABLE seniors ADD COLUMN pension TEXT DEFAULT ''`);
    } catch {
        // Column already exists
    }

    return db;
}

export async function insertSenior(
    db: SQLite.SQLiteDatabase,
    record: NewSeniorRecord
): Promise<number> {
    const result = await db.runAsync(
        `INSERT INTO seniors (
      last_name, first_name, middle_name, ext_name,
      birthday_month, birthday_day, birthday_year,
      sex, civil_status, cellphone_number, national_id, occupation, pension
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            record.last_name,
            record.first_name,
            record.middle_name,
            record.ext_name,
            record.birthday_month,
            record.birthday_day,
            record.birthday_year,
            record.sex,
            record.civil_status,
            record.cellphone_number,
            record.national_id,
            record.occupation,
            record.pension,
        ]
    );

    return result.lastInsertRowId;
}

export async function getAllSeniors(
    db: SQLite.SQLiteDatabase
): Promise<SeniorRecord[]> {
    const rows = await db.getAllAsync<SeniorRecord>(
        'SELECT * FROM seniors ORDER BY last_name ASC, first_name ASC'
    );
    return rows;
}

export async function searchSeniors(
    db: SQLite.SQLiteDatabase,
    query: string
): Promise<SeniorRecord[]> {
    const wildcard = `%${query}%`;
    const rows = await db.getAllAsync<SeniorRecord>(
        `SELECT * FROM seniors
     WHERE last_name LIKE ?
        OR first_name LIKE ?
        OR middle_name LIKE ?
        OR cellphone_number LIKE ?
        OR national_id LIKE ?
        OR pension LIKE ?
     ORDER BY last_name ASC, first_name ASC`,
        [wildcard, wildcard, wildcard, wildcard, wildcard, wildcard]
    );
    return rows;
}

export async function deleteSenior(
    db: SQLite.SQLiteDatabase,
    id: number
): Promise<void> {
    await db.runAsync('DELETE FROM seniors WHERE id = ?', [id]);
}

export async function getRecordCount(
    db: SQLite.SQLiteDatabase
): Promise<number> {
    const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM seniors'
    );
    return result?.count ?? 0;
}

export async function resetSeniorSequence(
    db: SQLite.SQLiteDatabase
): Promise<void> {
    const count = await getRecordCount(db);
    if (count === 0) {
        await db.runAsync(
            `DELETE FROM sqlite_sequence WHERE name = 'seniors'`
        );
    }
}

export async function getSeniorById(
    db: SQLite.SQLiteDatabase,
    id: number
): Promise<SeniorRecord | null> {
    const row = await db.getFirstAsync<SeniorRecord>(
        'SELECT * FROM seniors WHERE id = ?',
        [id]
    );
    return row ?? null;
}

export async function seniorExists(
    db: SQLite.SQLiteDatabase,
    firstName: string,
    lastName: string
): Promise<boolean> {
    const row = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM seniors
         WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)`,
        [firstName.trim(), lastName.trim()]
    );
    return (row?.count ?? 0) > 0;
}

export async function updateSenior(
    db: SQLite.SQLiteDatabase,
    id: number,
    record: NewSeniorRecord
): Promise<void> {
    await db.runAsync(
        `UPDATE seniors SET
            last_name = ?,
            first_name = ?,
            middle_name = ?,
            ext_name = ?,
            birthday_month = ?,
            birthday_day = ?,
            birthday_year = ?,
            sex = ?,
            civil_status = ?,
            cellphone_number = ?,
            national_id = ?,
            occupation = ?,
            pension = ?
         WHERE id = ?`,
        [
            record.last_name,
            record.first_name,
            record.middle_name,
            record.ext_name,
            record.birthday_month,
            record.birthday_day,
            record.birthday_year,
            record.sex,
            record.civil_status,
            record.cellphone_number,
            record.national_id,
            record.occupation,
            record.pension,
            id,
        ]
    );
}

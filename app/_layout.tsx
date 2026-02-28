import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../lib/database';
import Colors from '../constants/Colors';

export const DatabaseContext = React.createContext<SQLite.SQLiteDatabase | null>(null);

export default function RootLayout() {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initDb() {
            try {
                const database = await getDatabase();
                setDb(database);
            } catch (error) {
                console.error('Failed to initialize database:', error);
            } finally {
                setIsLoading(false);
            }
        }
        initDb();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <StatusBar style="light" />
            </View>
        );
    }

    return (
        <DatabaseContext.Provider value={db}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                }}
            />
        </DatabaseContext.Provider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});

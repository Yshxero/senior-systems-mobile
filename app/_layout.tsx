/**
 * _layout.tsx (Root Layout)
 *
 * The root layout for the Expo Router app.
 * Sets up the navigation container, status bar, and global providers.
 */

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../lib/database';
import Colors from '../constants/Colors';

/**
 * React Context to share the SQLite database instance across all screens.
 * This avoids re-opening the database on every screen.
 */
export const DatabaseContext = React.createContext<SQLite.SQLiteDatabase | null>(null);

export default function RootLayout() {
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize the database when the app starts
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

    // Show a loading spinner while the database is being set up
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
            {/* Light-on-dark status bar */}
            <StatusBar style="light" />

            {/* Stack navigator wrapping the tab layout */}
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

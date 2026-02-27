/**
 * _layout.tsx (Tabs Layout)
 *
 * Defines the bottom tab navigator with two tabs:
 * 1. Records — list of all saved senior records
 * 2. Add Record — form to add a new record
 *
 * Uses @expo/vector-icons for tab icons and our custom color palette.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                // Header styling
                headerStyle: {
                    backgroundColor: Colors.background,
                    elevation: 0,        // Remove shadow on Android
                    shadowOpacity: 0,    // Remove shadow on iOS
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.border,
                },
                headerTintColor: Colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                },
                // Tab bar styling
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopColor: Colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.tabActive,
                tabBarInactiveTintColor: Colors.tabInactive,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            {/* Tab 1: Records List */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Records',
                    headerTitle: 'Senior Records',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* Tab 2: Add Record Form */}
            <Tabs.Screen
                name="add"
                options={{
                    title: 'Add Record',
                    headerTitle: 'New Senior Record',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-add-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

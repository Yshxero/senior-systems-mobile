/**
 * index.tsx — Records List Screen
 */

import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { DatabaseContext } from '../_layout';
import {
    SeniorRecord,
    getAllSeniors,
    searchSeniors,
    deleteSenior,
    getRecordCount,
} from '../../lib/database';
import { exportRecordsToCsv } from '../../lib/exportCsv';
import { importRecordsFromCsv } from '../../lib/importCsv';
import RecordCard from '../../components/RecordCard';
import EmptyState from '../../components/EmptyState';

// ─── Pension filter options ───────────────────────────────────────────────────
const PENSION_FILTERS = ['All', 'SSS', 'GSIS', 'OSCA', 'N/A'];

export default function RecordsListScreen() {
    const db = useContext(DatabaseContext);

    const [records, setRecords] = useState<SeniorRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pensionFilter, setPensionFilter] = useState('All');
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Debounce timer reference — does NOT cause re-renders
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Load records from the database.
     * If a search query is present, filter results; otherwise load all.
     * Apply pension filter client-side after fetching.
     */
    const loadRecords = useCallback(async (query: string, pension: string) => {
        if (!db) return;
        try {
            const data = query.trim()
                ? await searchSeniors(db, query.trim())
                : await getAllSeniors(db);

            // Apply pension filter if not "All"
            const filtered = pension === 'All'
                ? data
                : data.filter(r => r.pension === pension);

            setRecords(filtered);

            // Total unfiltered count
            const count = await getRecordCount(db);
            setTotalCount(count);
        } catch (error) {
            console.error('Failed to load records:', error);
            Alert.alert('Error', 'Failed to load records from database.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [db]);

    // Reload every time screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            loadRecords(searchQuery, pensionFilter);
        }, [loadRecords, searchQuery, pensionFilter])
    );

    /**
     * Handle search input — debounced so it waits 300ms after the user
     * stops typing. Does NOT dismiss the keyboard (no blur called).
     */
    const handleSearch = (text: string) => {
        setSearchQuery(text);

        // Cancel previous timer
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        // Schedule new load
        debounceTimer.current = setTimeout(() => {
            loadRecords(text, pensionFilter);
        }, 300);
    };

    // Clear debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    /** Pension filter chip press */
    const handlePensionFilter = (filter: string) => {
        setPensionFilter(filter);
        loadRecords(searchQuery, filter);
    };

    /** Handle deleting a record. */
    const handleDelete = async (id: number) => {
        if (!db) return;
        try {
            await deleteSenior(db, id);
            await loadRecords(searchQuery, pensionFilter);
        } catch (error) {
            console.error('Failed to delete record:', error);
            Alert.alert('Error', 'Failed to delete the record.');
        }
    };

    /** Pull-to-refresh. */
    const handleRefresh = () => {
        setIsRefreshing(true);
        loadRecords(searchQuery, pensionFilter);
    };

    /** Import records from a CSV file. */
    const handleImport = async () => {
        if (!db) return;
        setIsImporting(true);
        try {
            const result = await importRecordsFromCsv(db);
            if (result === null) return; // user cancelled

            const msg = [
                `✅ Imported: ${result.imported} record${result.imported !== 1 ? 's' : ''}`,
                result.duplicates > 0 ? `🔁 Duplicates skipped: ${result.duplicates}` : null,
                result.skipped > 0 ? `⚠️ Invalid rows skipped: ${result.skipped}` : null,
                result.errors.length > 0 ? `\nErrors:\n${result.errors.slice(0, 3).join('\n')}` : null,
            ].filter(Boolean).join('\n');

            Alert.alert('Import Complete', msg);
            await loadRecords(searchQuery, pensionFilter);
        } catch (e: any) {
            Alert.alert('Import Error', e?.message ?? 'Failed to import CSV.');
        } finally {
            setIsImporting(false);
        }
    };

    /** Export ALL records (alphabetical order) to CSV. */
    const handleExport = async () => {
        if (!db) return;

        if (totalCount === 0) {
            Alert.alert('No Records', 'There are no records to export.');
            return;
        }

        setIsExporting(true);
        try {
            const allRecords = await getAllSeniors(db);
            await exportRecordsToCsv(allRecords);
        } catch (error: any) {
            if (
                error?.message !== 'Sharing is not available on this device.' &&
                error?.message !== 'No records to export.'
            ) {
                console.error('Export failed:', error);
                Alert.alert('Export Error', error?.message ?? 'Failed to export.');
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, phone, ID, pension..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        selectionColor={Colors.primary}
                        returnKeyType="search"
                        // Do NOT use onSubmitEditing to dismiss keyboard
                        blurOnSubmit={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            loadRecords('', pensionFilter);
                        }}>
                            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Pension filter chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterRow}
                    contentContainerStyle={styles.filterContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {PENSION_FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterChip,
                                pensionFilter === f && styles.filterChipActive,
                            ]}
                            onPress={() => handlePensionFilter(f)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    pensionFilter === f && styles.filterChipTextActive,
                                ]}
                            >
                                {f === 'All' ? '🗂 All' : `💰 ${f}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Record count badge */}
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {searchQuery.trim() || pensionFilter !== 'All'
                            ? `${records.length} of ${totalCount}`
                            : `${totalCount} record${totalCount !== 1 ? 's' : ''}`}
                    </Text>
                </View>
            </View>

            {/* Records list */}
            <FlatList
                data={records}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <RecordCard record={item} onDelete={handleDelete} />
                )}
                contentContainerStyle={
                    records.length === 0 ? styles.emptyList : styles.list
                }
                ListEmptyComponent={
                    searchQuery.trim() || pensionFilter !== 'All' ? (
                        <EmptyState
                            title="No Results"
                            subtitle="No records match your search or filter."
                        />
                    ) : (
                        <EmptyState />
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                        progressBackgroundColor={Colors.backgroundLight}
                    />
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />

            {/* Import CSV button */}
            <TouchableOpacity
                style={styles.importFab}
                onPress={handleImport}
                activeOpacity={0.8}
                disabled={isImporting}
            >
                {isImporting ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
                        <Text style={styles.importFabText}>Import CSV</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Export to CSV — Floating Action Button */}
            {totalCount > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleExport}
                    activeOpacity={0.8}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <ActivityIndicator size="small" color={Colors.text} />
                    ) : (
                        <>
                            <Ionicons name="download-outline" size={22} color={Colors.text} />
                            <Text style={styles.fabText}>Export CSV</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        padding: 0,
    },
    filterRow: {
        marginTop: 10,
        marginBottom: 2,
    },
    filterContent: {
        gap: 8,
        paddingRight: 4,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterChipTextActive: {
        color: '#fff',
    },
    countBadge: {
        alignSelf: 'flex-start',
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: Colors.backgroundLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    countText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    list: {
        paddingVertical: 8,
        paddingBottom: 90,
    },
    emptyList: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.accent,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 28,
        elevation: 6,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    importFab: {
        position: 'absolute',
        right: 16,
        bottom: 80, // sits above the export FAB
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#16a34a', // green
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 28,
        elevation: 6,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    importFabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});

/**
 * edit.tsx — Edit Record Screen
 */

import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { DatabaseContext } from './_layout';
import { updateSenior, getSeniorById, NewSeniorRecord } from '../lib/database';
import FormField from '../components/FormField';
import PickerField from '../components/PickerField';

// reuse your option lists (copy from add.tsx)
const MONTHS = [
    '01 - January', '02 - February', '03 - March', '04 - April',
    '05 - May', '06 - June', '07 - July', '08 - August',
    '09 - September', '10 - October', '11 - November', '12 - December',
];

const DAYS = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, '0')
);

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
    { length: currentYear - 1919 },
    (_, i) => String(currentYear - i)
);

const SEX_OPTIONS = ['Male', 'Female'];

const CIVIL_STATUS_OPTIONS = [
    'Single', 'Married', 'Widowed', 'Separated', 'Divorced',
];

const PENSION_OPTIONS = ['SSS', 'GSIS', 'OSCA', 'N/A'];

export default function EditRecordScreen() {
    const db = useContext(DatabaseContext);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [form, setForm] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 🔥 LOAD RECORD
    useEffect(() => {
        const load = async () => {
            if (!db || !id) return;

            const record = await getSeniorById(db, Number(id));
            if (!record) {
                Alert.alert('Error', 'Record not found.');
                router.back();
                return;
            }

            setForm({
                lastName: record.last_name,
                firstName: record.first_name,
                middleName: record.middle_name,
                extName: record.ext_name,
                birthdayMonth: record.birthday_month,
                birthdayDay: record.birthday_day,
                birthdayYear: record.birthday_year,
                sex: record.sex,
                civilStatus: record.civil_status,
                cellphoneNumber: record.cellphone_number,
                nationalId: record.national_id,
                occupation: record.occupation,
                pension: record.pension ?? '',
            });
        };

        load();
    }, [db, id]);


    const updateField = (field: string, value: string) => {
        setForm((prev: any) => ({ ...prev, [field]: value }));
    };

    // 🔥 SAVE UPDATE
    const handleSave = async () => {
        if (!db || !form) return;

        setIsSaving(true);

        try {
            const updated: NewSeniorRecord = {
                last_name: form.lastName.trim(),
                first_name: form.firstName.trim(),
                middle_name: form.middleName.trim(),
                ext_name: form.extName.trim(),
                birthday_month: form.birthdayMonth.length === 2
                    ? form.birthdayMonth
                    : form.birthdayMonth.slice(0, 2),
                birthday_day: form.birthdayDay,
                birthday_year: form.birthdayYear,
                sex: form.sex,
                civil_status: form.civilStatus,
                cellphone_number: form.cellphoneNumber || 'N/A',
                national_id: form.nationalId || 'N/A',
                occupation: form.occupation,
                pension: form.pension || 'N/A',
            };

            await updateSenior(db, Number(id), updated);

            Alert.alert('✅ Updated', 'Record updated successfully.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e) {
            Alert.alert('Error', 'Failed to update record.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (!form) {
        return (
            <View style={styles.loading}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>

                <FormField
                    label="Last Name"
                    required
                    value={form.lastName}
                    onChangeText={(t) => updateField('lastName', t)}
                />
                <FormField
                    label="First Name"
                    required
                    value={form.firstName}
                    onChangeText={(t) => updateField('firstName', t)}
                />
                <FormField
                    label="Middle Name"
                    value={form.middleName}
                    onChangeText={(t) => updateField('middleName', t)}
                />
                <FormField
                    label="Ext Name"
                    value={form.extName}
                    onChangeText={(t) => updateField('extName', t)}
                />

                {/* Birthday */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Birthday</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <PickerField
                            label="Month"
                            value={form.birthdayMonth}
                            options={MONTHS}
                            onSelect={(v) => updateField('birthdayMonth', v)}
                        />
                    </View>

                    <View style={styles.flex05}>
                        <PickerField
                            label="Day"
                            value={form.birthdayDay}
                            options={DAYS}
                            onSelect={(v) => updateField('birthdayDay', v)}
                        />
                    </View>

                    <View style={styles.flex05}>
                        <PickerField
                            label="Year"
                            value={form.birthdayYear}
                            options={YEARS}
                            onSelect={(v) => updateField('birthdayYear', v)}
                        />
                    </View>
                </View>

                {/* Demographics */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Demographics</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <PickerField
                            label="Sex"
                            value={form.sex}
                            options={SEX_OPTIONS}
                            onSelect={(v) => updateField('sex', v)}
                        />
                    </View>

                    <View style={styles.flex1}>
                        <PickerField
                            label="Civil Status"
                            value={form.civilStatus}
                            options={CIVIL_STATUS_OPTIONS}
                            onSelect={(v) => updateField('civilStatus', v)}
                        />
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="card-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Contact & Identification</Text>
                </View>

                <FormField
                    label="Cellphone Number"
                    value={form.cellphoneNumber}
                    onChangeText={(t) => updateField('cellphoneNumber', t)}
                />

                <FormField
                    label="National ID"
                    value={form.nationalId}
                    onChangeText={(t) => updateField('nationalId', t)}
                />

                <FormField
                    label="Occupation"
                    value={form.occupation}
                    onChangeText={(t) => updateField('occupation', t)}
                />

                {/* Pension Section */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Pension</Text>
                </View>

                <PickerField
                    label="Pension Type"
                    value={form.pension}
                    options={PENSION_OPTIONS}
                    onSelect={(v) => updateField('pension', v)}
                />

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveText}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { padding: 16 },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: Colors.text,
    },
    actions: { marginTop: 24, gap: 12 },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    saveText: { color: Colors.text, fontWeight: '700' },
    cancelText: { color: Colors.textSecondary, fontWeight: '600' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    row: { flexDirection: 'row', gap: 12 },
    flex1: { flex: 1 },
    flex05: { flex: 0.5 },
});
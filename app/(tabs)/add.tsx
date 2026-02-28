import React, { useState, useContext, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { DatabaseContext } from '../_layout';
import { insertSenior, NewSeniorRecord } from '../../lib/database';
import FormField from '../../components/FormField';
import PickerField from '../../components/PickerField';

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
    'Single',
    'Married',
    'Widowed',
    'Separated',
    'Divorced',
];

const PENSION_OPTIONS = ['SSS', 'GSIS', 'OSCA', 'N/A'];

interface FormState {
    lastName: string;
    firstName: string;
    middleName: string;
    extName: string;
    birthdayMonth: string;
    birthdayDay: string;
    birthdayYear: string;
    sex: string;
    civilStatus: string;
    cellphoneNumber: string;
    nationalId: string;
    occupation: string;
    pension: string;
}

interface FormErrors {
    [key: string]: string | undefined;
}

const INITIAL_FORM: FormState = {
    lastName: '',
    firstName: '',
    middleName: '',
    extName: '',
    birthdayMonth: '',
    birthdayDay: '',
    birthdayYear: '',
    sex: '',
    civilStatus: '',
    cellphoneNumber: '',
    nationalId: '',
    occupation: '',
    pension: '',
};

export default function AddRecordScreen() {
    const db = useContext(DatabaseContext);
    const router = useRouter();

    const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const updateField = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!form.birthdayMonth) newErrors.birthdayMonth = 'Month is required';
        if (!form.birthdayDay) newErrors.birthdayDay = 'Day is required';
        if (!form.birthdayYear) newErrors.birthdayYear = 'Year is required';
        if (!form.sex) newErrors.sex = 'Sex is required';
        if (!form.civilStatus) newErrors.civilStatus = 'Civil status is required';

        if (form.cellphoneNumber.trim() && !/^[0-9+\-\s()]+$/.test(form.cellphoneNumber)) {
            newErrors.cellphoneNumber = 'Invalid phone number format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        if (!db) {
            Alert.alert('Error', 'Database not available.');
            return;
        }

        setIsSaving(true);

        try {
            const record: NewSeniorRecord = {
                last_name: form.lastName.trim(),
                first_name: form.firstName.trim(),
                middle_name: form.middleName.trim(),
                ext_name: form.extName.trim(),
                birthday_month: form.birthdayMonth.slice(0, 2),
                birthday_day: form.birthdayDay,
                birthday_year: form.birthdayYear,
                sex: form.sex,
                civil_status: form.civilStatus,
                cellphone_number: form.cellphoneNumber.trim() || 'N/A',
                national_id: form.nationalId.trim() || 'N/A',
                occupation: form.occupation.trim(),
                pension: form.pension.trim() || 'N/A',
            };

            await insertSenior(db, record);

            Alert.alert(
                '✅ Record Saved',
                `${record.first_name} ${record.last_name} has been added successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setForm({ ...INITIAL_FORM });
                            setErrors({});
                            router.navigate('/(tabs)');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to save record:', error);
            Alert.alert('Error', 'Failed to save the record. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        Alert.alert('Reset Form', 'Are you sure you want to clear all fields?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                    setForm({ ...INITIAL_FORM });
                    setErrors({});
                },
            },
        ]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.sectionHeader}>
                    <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>

                <FormField
                    label="Last Name"
                    required
                    placeholder="e.g. Dela Cruz"
                    value={form.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    error={errors.lastName}
                    autoCapitalize="words"
                />
                <FormField
                    label="First Name"
                    required
                    placeholder="e.g. Juan"
                    value={form.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    error={errors.firstName}
                    autoCapitalize="words"
                />
                <FormField
                    label="Middle Name"
                    placeholder="e.g. Santos"
                    value={form.middleName}
                    onChangeText={(text) => updateField('middleName', text)}
                    autoCapitalize="words"
                />
                <FormField
                    label="Ext Name"
                    placeholder="e.g. Jr., Sr., III"
                    value={form.extName}
                    onChangeText={(text) => updateField('extName', text)}
                    autoCapitalize="characters"
                />

                <View style={styles.sectionHeader}>
                    <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Birthday</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <PickerField
                            label="Month"
                            required
                            value={form.birthdayMonth}
                            placeholder="Month"
                            options={MONTHS}
                            onSelect={(value) => updateField('birthdayMonth', value)}
                            error={errors.birthdayMonth}
                        />
                    </View>
                    <View style={styles.flex05}>
                        <PickerField
                            label="Day"
                            required
                            value={form.birthdayDay}
                            placeholder="Day"
                            options={DAYS}
                            onSelect={(value) => updateField('birthdayDay', value)}
                            error={errors.birthdayDay}
                        />
                    </View>
                    <View style={styles.flex05}>
                        <PickerField
                            label="Year"
                            required
                            value={form.birthdayYear}
                            placeholder="Year"
                            options={YEARS}
                            onSelect={(value) => updateField('birthdayYear', value)}
                            error={errors.birthdayYear}
                        />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Demographics</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <PickerField
                            label="Sex"
                            required
                            value={form.sex}
                            placeholder="Select"
                            options={SEX_OPTIONS}
                            onSelect={(value) => updateField('sex', value)}
                            error={errors.sex}
                        />
                    </View>
                    <View style={styles.flex1}>
                        <PickerField
                            label="Civil Status"
                            required
                            value={form.civilStatus}
                            placeholder="Select"
                            options={CIVIL_STATUS_OPTIONS}
                            onSelect={(value) => updateField('civilStatus', value)}
                            error={errors.civilStatus}
                        />
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Ionicons name="card-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Contact & Identification</Text>
                </View>

                <FormField
                    label="Cellphone Number"
                    placeholder="e.g. 09171234567"
                    value={form.cellphoneNumber}
                    onChangeText={(text) => updateField('cellphoneNumber', text)}
                    error={errors.cellphoneNumber}
                    keyboardType="phone-pad"
                />
                <FormField
                    label="National ID"
                    placeholder="e.g. PSN-1234-5678-9012"
                    value={form.nationalId}
                    onChangeText={(text) => updateField('nationalId', text)}
                    autoCapitalize="characters"
                />
                <FormField
                    label="Occupation"
                    placeholder="e.g. Retired Teacher"
                    value={form.occupation}
                    onChangeText={(text) => updateField('occupation', text)}
                    autoCapitalize="words"
                />

                <View style={styles.sectionHeader}>
                    <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Pension</Text>
                </View>

                <PickerField
                    label="Pension Type"
                    value={form.pension}
                    placeholder="Select pension (optional)"
                    options={PENSION_OPTIONS}
                    onSelect={(value) => updateField('pension', value)}
                />

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving ? styles.buttonDisabled : null]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={isSaving}
                    >
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={22}
                            color={Colors.text}
                        />
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={20}
                            color={Colors.textSecondary}
                        />
                        <Text style={styles.resetButtonText}>Reset Form</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    flex05: {
        flex: 0.6,
    },
    actions: {
        marginTop: 24,
        gap: 12,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});

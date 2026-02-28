import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { SeniorRecord } from '../lib/database';
import { useRouter } from 'expo-router';

interface RecordCardProps {
    record: SeniorRecord;
    onDelete: (id: number) => void;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function RecordCard({ record, onDelete }: RecordCardProps) {
    const fullName = [
        record.last_name,
        record.first_name,
        record.middle_name,
        record.ext_name,
    ]
        .filter(Boolean)
        .join(', ');

    const monthIndex = parseInt(record.birthday_month, 10) - 1;
    const monthName = MONTHS[monthIndex] || record.birthday_month;
    const birthday = `${monthName} ${record.birthday_day}, ${record.birthday_year}`;

    const router = useRouter();
    const handleEdit = () => {
        console.log('Edit record ID:', record.id);
        router.push({
            pathname: '/edit',
            params: { id: record.id },
        });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Record',
            `Are you sure you want to delete the record for ${record.first_name} ${record.last_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete(record.id),
                },
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {record.last_name}, {record.first_name}
                    </Text>
                    {(record.middle_name || record.ext_name) && (
                        <Text style={styles.subName} numberOfLines={1}>
                            {[record.middle_name, record.ext_name].filter(Boolean).join(' ')}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={handleEdit}
                    style={styles.editButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </TouchableOpacity>
            </View>

            <View style={styles.infoGrid}>
                <InfoItem icon="calendar-outline" label="Birthday" value={birthday} />
                <InfoItem icon="person-outline" label="Sex" value={record.sex} />
                <InfoItem icon="heart-outline" label="Status" value={record.civil_status} />
                <InfoItem icon="briefcase-outline" label="Occupation" value={record.occupation || '—'} />
                <InfoItem icon="call-outline" label="Phone" value={record.cellphone_number || 'N/A'} />
                <InfoItem icon="card-outline" label="National ID" value={record.national_id || 'N/A'} />
                <InfoItem icon="wallet-outline" label="Pension" value={record.pension || 'N/A'} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>ID: #{record.id}</Text>
                <Text style={styles.footerText}>
                    {record.created_at ? new Date(record.created_at).toLocaleDateString() : ''}
                </Text>
            </View>
        </View>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoItem}>
            <Ionicons name={icon} size={14} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundLight,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    nameContainer: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    subName: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginEnd: 10,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    infoGrid: {
        gap: 6,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        width: 75,
    },
    infoValue: {
        fontSize: 13,
        color: Colors.text,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerText: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
});

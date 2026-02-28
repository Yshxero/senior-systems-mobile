import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface PickerFieldProps {
    label: string;
    required?: boolean;
    value: string;
    placeholder?: string;
    options: string[];
    onSelect: (value: string) => void;
    error?: string;
}

export default function PickerField({
    label,
    required = false,
    value,
    placeholder = 'Select...',
    options,
    onSelect,
    error,
}: PickerFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>

            <TouchableOpacity
                style={[styles.trigger, error ? styles.triggerError : null]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.triggerText,
                        !value ? styles.placeholder : null,
                    ]}
                >
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={18}
                    color={Colors.textSecondary}
                />
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item === value ? styles.optionSelected : null,
                                    ]}
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item === value ? styles.optionTextSelected : null,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                    {item === value && (
                                        <Ionicons
                                            name="checkmark"
                                            size={18}
                                            color={Colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    required: {
        fontSize: 14,
        color: Colors.danger,
        marginLeft: 4,
    },
    trigger: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    triggerError: {
        borderColor: Colors.danger,
    },
    triggerText: {
        fontSize: 15,
        color: Colors.text,
    },
    placeholder: {
        color: Colors.textSecondary,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        marginTop: 4,
        marginLeft: 4,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.overlay,
    },
    modal: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: Colors.backgroundLight,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderRadius: 10,
        marginBottom: 4,
    },
    optionSelected: {
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
    },
    optionText: {
        fontSize: 15,
        color: Colors.text,
    },
    optionTextSelected: {
        color: Colors.primary,
        fontWeight: '600',
    },
});

import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import Colors from '../constants/Colors';

interface FormFieldProps extends TextInputProps {
    label: string;
    required?: boolean;
    error?: string;
}

export default function FormField({
    label,
    required = false,
    error,
    style,
    ...textInputProps
}: FormFieldProps) {
    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>

            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor={Colors.textSecondary}
                selectionColor={Colors.primary}
                {...textInputProps}
            />

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
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
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 14,
        fontSize: 15,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputError: {
        borderColor: Colors.danger,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        marginTop: 4,
        marginLeft: 4,
    },
});

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

function ZoomPressable({ children, style, ...props }) {
    return (
        <Pressable
            {...props}
            style={({ pressed }) => [
                style,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
        >
            {children}
        </Pressable>
    );
}

export default function ConfirmDeleteModal({
    visible,
    onCancel,
    onConfirm,
    title = 'Supprimer ?',
    message = 'Cette action est irréversible.',
    confirmText = 'Supprimer',
    cancelText = 'Annuler',
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        <ZoomPressable style={[styles.cancelBtn, { flex: 1, marginRight: 8 }]} onPress={onCancel}>
                            <Text style={styles.btnText}>{cancelText}</Text>
                        </ZoomPressable>
                        <ZoomPressable style={[styles.confirmBtn, { flex: 1, marginLeft: 8 }]} onPress={onConfirm}>
                            <Text style={styles.btnText}>{confirmText}</Text>
                        </ZoomPressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: 320,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#203D80',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        color: '#900',
        marginBottom: 16,
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelBtn: {
        backgroundColor: '#203D80',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtn: {
        backgroundColor: '#900',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

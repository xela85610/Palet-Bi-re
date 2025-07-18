import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Switch, Modal } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { getRules, saveRules } from '../storage/Storage';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { createRule } from '../models/Rule';
import { Audio } from 'expo-av';

export default function RegleScreen() {
    const [rules, setRules] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [score, setScore] = useState('');
    const [title, setTitle] = useState('');
    const [sips, setSips] = useState('');
    const [culSec, setCulSec] = useState(false);
    const [selonScore, setSelonScore] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState(null);
    const [scoreError, setScoreError] = useState('');

    useEffect(() => {
        loadRules();
    }, []);

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/delete.mp3')
        );
        await sound.playAsync();
    }

    const loadRules = async () => {
        const data = await getRules();
        if (data && data.length > 0) {
            setRules(data);
        } else {
            const defaultRules = [
                createRule('Égalité', 'RENCONTRE !', 1),
            ];
            setRules(defaultRules);
            await saveRules(defaultRules);
        }
    };

    const saveRulesToStorage = async (newRules) => {
        setRules(newRules);
        await saveRules(newRules);
    };

    const validateScore = (score) => {
        if (/^[eé]galité$/i.test(score.trim())) return '';
        const regex = /^(\d{1,2})-(\d{1,2})$/;
        const match = score.match(regex);
        if (!match) return 'Le format doit être x-x (ex: 8-5) ou Égalité';
        const a = parseInt(match[1], 10);
        const b = parseInt(match[2], 10);
        if (a < 0 || a > 13 || b < 0 || b > 13) return 'Chaque score doit être compris entre 0 et 13';
        return '';
    };

    const addRule = () => {
        const error = validateScore(score.trim());
        setScoreError(error);
        if (error) return;
        if (!score.trim() || !title.trim()) return;
        let sipsValue = '';
        if (culSec) sipsValue = 'Cul sec !';
        else if (selonScore) sipsValue = 'Gorgées selon le score';
        else if (sips) sipsValue = `${sips}`;
        if (culSec || selonScore) {
            setSips('');
        }
        const newRule = createRule(score.trim(), title.trim(), sipsValue);
        const updated = [...rules, newRule];
        saveRulesToStorage(updated);
        setScore('');
        setTitle('');
        setSips('');
        setCulSec(false);
        setSelonScore(false);
        setModalVisible(false);
        setScoreError('');
    };

    const askDeleteRule = (id) => {
        setRuleToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDeleteRule = async () => {
        await playSound();
        const updated = rules.filter(r => r.id !== ruleToDelete);
        saveRulesToStorage(updated);
        setDeleteModalVisible(false);
        setRuleToDelete(null);
    };

    const cancelDeleteRule = () => {
        setDeleteModalVisible(false);
        setRuleToDelete(null);
    };

    const toggleRule = (id) => {
        const updated = rules.map(r => r.id === id ? { ...r, active: !r.active } : r);
        saveRulesToStorage(updated);
    };

    const renderItem = ({ item: rule }) => (
        <View style={styles.ruleCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.ruleScore}>{rule.scorePattern || ''}</Text>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleSips}>{
                    rule.sips === 'Cul sec !' ? 'Cul sec !' :
                        rule.sips === 'Gorgées selon le score' ? 'Gorgées selon score' :
                            rule.sips ? `${rule.sips} Gorgée(s)` : 'Gorgées selon score'
                }</Text>
            </View>
            <Switch value={rule.active} onValueChange={() => toggleRule(rule.id)} />
            <View style={styles.deleteBtnWrapper}>
                <ZoomPressable onPress={() => askDeleteRule(rule.id)}>
                    <Feather name="trash-2" size={24} color="#B00020" />
                </ZoomPressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Règles personnalisées</Text>
                    <Pressable
                        style={styles.infoIcon}
                        onPress={() => setInfoModalVisible(true)}>
                        <Text style={styles.infoText}>i</Text>
                    </Pressable>
            </View>
            <Text style={styles.subtitle}>Vous pouvez activer ou non les règles pour les parties.</Text>
            <FlatList
                data={rules}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            <ConfirmDeleteModal
                visible={deleteModalVisible}
                onCancel={cancelDeleteRule}
                onConfirm={confirmDeleteRule}
                title="Supprimer cette règle ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
            />
            <ZoomPressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <AntDesign name="plus" size={30} color="#fff" />
            </ZoomPressable>
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { padding: 28 }]}>
                        <Text style={[styles.modalTitle, { marginBottom: 28 }]}>Ajouter une règle</Text>
                        <View style={{ width: '100%' }}>
                            {scoreError ? (
                                <Text style={{ color: 'red', marginBottom: 10, marginLeft: 4, fontSize: 13 }}>{scoreError}</Text>
                            ) : null}
                            <TextInput
                                placeholder="Score déclencheur (ex: 8-5, Égalité)"
                                value={score}
                                onChangeText={t => { setScore(t); setScoreError(''); }}
                                style={[styles.input, { marginBottom: 24 }]}
                            />
                        </View>
                        <TextInput
                            placeholder="Titre de la règle"
                            value={title}
                            onChangeText={setTitle}
                            style={[styles.input, { marginBottom: 24 }]}
                        />
                        <TextInput
                            placeholder="Nombre de gorgées (optionnel)"
                            value={sips}
                            onChangeText={setSips}
                            style={[styles.input, { marginBottom: 24 }]}
                            keyboardType="numeric"
                            editable={!culSec && !selonScore}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
                            <Pressable
                                onPress={() => { setCulSec(!culSec); if (!culSec) setSelonScore(false); }}
                                style={[styles.checkbox, culSec && styles.checkboxChecked]}
                            >
                                {culSec && <View style={styles.checkboxInner} />}
                            </Pressable>
                            <Text style={{ marginRight: 28 }}>Cul sec</Text>
                            <Pressable
                                onPress={() => { setSelonScore(!selonScore); if (!selonScore) setCulSec(false); }}
                                style={[styles.checkbox, selonScore && styles.checkboxChecked]}
                            >
                                {selonScore && <View style={styles.checkboxInner} />}
                            </Pressable>
                            <Text>Selon le score</Text>
                        </View>
                        <View style={[styles.modalButtons, { marginTop: 10 }]}> {/* plus d'espace au-dessus des boutons */}
                            <ZoomPressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Annuler</Text>
                            </ZoomPressable>
                            <ZoomPressable style={styles.confirmBtn} onPress={addRule}>
                                <Text style={styles.btnText}>Ajouter</Text>
                            </ZoomPressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent
                visible={infoModalVisible}
                onRequestClose={() => setInfoModalVisible(false)}
            >
                <View style={styles.modalInfo}>
                    <View style={[styles.modalInfoContent, { padding: 28 }]}>
                        <Text style={styles.modalTitle}>Explication des règles personnalisées</Text>
                        <Text style={styles.modalText}>Ici, vous pouvez ajouter ce qu'on appelle des 'règles', c'est à dire, à tel score il se passe tel chose. Par exemple si le score est de 8-5, celui qui a 8 boit 8 gorgées et celui qui à 5 boit 5 gorgées ou encore, à 4-1, le premier qui dit le mot "Poésie" donne 1 gorgée à l'autre ect.</Text>
                        <ZoomPressable style={styles.confirmInfoBtn} onPress={() => setInfoModalVisible(false)}>
                            <Text style={styles.confirmInfoText}>OK</Text>
                        </ZoomPressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        padding: 20,
        userSelect: 'none',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 3,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#B05C00',
        marginBottom: 15,
        textAlign: 'center',
    },
    ruleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        elevation: 4,
    },
    deleteBtnWrapper: {
        marginLeft: 18,
    },
    deleteBtn: {
        padding: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ruleScore: {
        fontWeight: 'bold',
        color: '#203D80',
        fontSize: 16,
    },
    ruleTitle: {
        fontSize: 15,
        color: '#444',
    },
    ruleSips: {
        fontSize: 13,
        color: '#B05C00',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#203D80',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 30,
        userSelect: 'none',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelBtn: {
        backgroundColor: '#999',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginRight: 5,
    },
    confirmBtn: {
        backgroundColor: '#203D80',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginLeft: 5,
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#203D80',
        borderRadius: 6,
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#203D80',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    modalInfo: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 30,
        userSelect: 'none',
    },
    modalInfoContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        elevation: 10,
    },
    modalText: {
        fontSize: 18,
        color: '#000',
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'justify',
    },
    infoIcon: {
        width: 20,
        height: 20,
        borderRadius: 15,
        backgroundColor: '#BFA68B',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    infoText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    confirmInfoBtn: {
        backgroundColor: '#203D80',
        textAlign: 'center',
        marginHorizontal: 90,
        fontSize: 18,
        borderRadius: 10,
    },
    confirmInfoText: {
        color: '#fff',
        padding: 10,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

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

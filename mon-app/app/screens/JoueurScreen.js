import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal, Image} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPlayers, savePlayers } from '../storage/Storage';
import { createPlayer } from '../models/Player';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {Audio} from "expo-av";

function ZoomPressable({ children, style, ...props }) {
    return (
        <Pressable
            {...props}
            style={({ pressed }) => [
                style,
                { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
        >
            {children}
        </Pressable>
    );
}

export default function JoueurScreen() {
    const [players, setPlayers] = useState([]);
    const [newName, setNewName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState(null);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        let data = await getPlayers();
        if (!data || !Array.isArray(data) || data.length === 0) {
            const blue = { ...createPlayer('Equipe bleu', null, { color: '#1976D2' }), id: 'equipe-bleu' };
            await new Promise(res => setTimeout(res, 1));
            const red = { ...createPlayer('Equipe rouge', null, { color: '#D32F2F' }), id: 'equipe-rouge' };
            const defaultPlayers = [blue, red];
            setPlayers(defaultPlayers);
            await savePlayers(defaultPlayers);
        } else {
            const cleanData = data.filter(p => p && typeof p === 'object' && p.id);
            setPlayers(cleanData);
            if (cleanData.length !== data.length) {
                await savePlayers(cleanData);
            }
        }
    };

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/delete.mp3')
        );
        await sound.playAsync();
    }

    const pickImage = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission caméra refusée');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            cameraType: 'front',
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleAddPlayer = async () => {
        if (!newName.trim()) return;
        const newPlayer = createPlayer(newName.trim(), avatarUri);
        const updated = [...players, newPlayer];
        setPlayers(updated);
        await savePlayers(updated);
        setNewName('');
        setAvatarUri(null);
        setModalVisible(false);
    };

    const askDeletePlayer = (player) => {
        setPlayerToDelete(player);
        setDeleteModalVisible(true);
    };
    const confirmDeletePlayer = async () => {
        await playSound();
        if (!playerToDelete) return;
        const updated = players.filter((p) => p.id !== playerToDelete.id);
        setPlayers(updated);
        await savePlayers(updated);
        setDeleteModalVisible(false);
        setPlayerToDelete(null);
    };
    const cancelDeletePlayer = () => {
        setDeleteModalVisible(false);
        setPlayerToDelete(null);
    };

    const openStatsModal = (player) => {
        setSelectedPlayer(player);
        setShowStatsModal(true);
    };
    const closeStatsModal = () => {
        setShowStatsModal(false);
        setSelectedPlayer(null);
    };

    const renderItem = ({ item }) => (
        <ZoomPressable onPress={() => openStatsModal(item)} style={styles.playerCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: item.color || (item.name === 'Equipe bleu' ? '#1976D2' : item.name === 'Equipe rouge' ? '#D32F2F' : '#ccc'), justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>{item.name[0].toUpperCase()}</Text>
                    </View>
                )}
                <Text style={styles.playerName}>{item.name}</Text>
            </View>
            <ZoomPressable onPress={() => askDeletePlayer(item)} style={styles.deleteBtn} hitSlop={16}>
                <Feather name="trash-2" size={24} color="#900" />
            </ZoomPressable>
        </ZoomPressable>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Joueurs</Text>
            <FlatList
                data={players.filter(p => p && typeof p === 'object' && p.id)}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
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
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter un joueur</Text>
                        <ZoomPressable onPress={pickImage} style={styles.avatarPicker}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarLarge} />
                            ) : (
                                <View style={[styles.avatarLarge, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                                    <AntDesign name="plus" size={36} color="#fff" />
                                </View>
                            )}
                        </ZoomPressable>
                        <TextInput
                            placeholder="Nom du joueur"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <ZoomPressable style={styles.cancelBtn} onPress={() => { setModalVisible(false); setAvatarUri(null); }}>
                                <Text style={styles.btnText}>Annuler</Text>
                            </ZoomPressable>
                            <ZoomPressable style={styles.confirmBtn} onPress={handleAddPlayer}>
                                <Text style={styles.btnText}>Ajouter</Text>
                            </ZoomPressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showStatsModal}
                transparent
                animationType="fade"
                onRequestClose={closeStatsModal}
            >
                <View style={styles.statsModalOverlay}>
                    <View style={styles.statsModalContent}>
                        {selectedPlayer && (
                            <>
                                {selectedPlayer.photoUri ? (
                                    <Image source={{ uri: selectedPlayer.photoUri }} style={styles.avatarLarge} />
                                ) : (
                                    <View style={[styles.avatarLarge, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: '#fff', fontSize: 32 }}>{selectedPlayer.name[0].toUpperCase()}</Text>
                                    </View>
                                )}
                                <Text style={styles.statsName}>{selectedPlayer.name}</Text>
                                <Text style={styles.statsLabel}>Parties jouées : <Text style={styles.statsValue}>{selectedPlayer.gamesPlayed ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Victoires : <Text style={styles.statsValue}>{selectedPlayer.victories ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Gorgées bues : <Text style={styles.statsValue}>{selectedPlayer.sipDrinks ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Série de victoire : <Text style={styles.statsValue}>{selectedPlayer.winStreak ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Meilleure série : <Text style={styles.statsValue}>{selectedPlayer.bestStreak ?? 0}</Text></Text>
                                <ZoomPressable style={styles.closeStatsBtn} onPress={closeStatsModal}>
                                    <Text style={styles.btnText}>Fermer</Text>
                                </ZoomPressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <ConfirmDeleteModal
                visible={deleteModalVisible}
                onCancel={cancelDeletePlayer}
                onConfirm={confirmDeletePlayer}
                title="Supprimer ce joueur ?"
                message="Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
            />
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
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    playerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        elevation: 4,
    },
    playerName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#203D80',
        marginLeft: 4,
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
        color: '#203D80',
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
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignSelf: 'center',
        marginBottom: 10,
        backgroundColor: '#ccc',
    },
    avatarPicker: {
        alignItems: 'center',
        marginBottom: 10,
    },
    statsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        minWidth: 260,
        elevation: 10,
        userSelect: 'none',
    },
    statsName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#203D80',
    },
    statsLabel: {
        fontSize: 16,
        color: '#444',
        marginBottom: 4,
    },
    statsValue: {
        fontWeight: 'bold',
        color: '#B05C00',
    },
    closeStatsBtn: {
        marginTop: 18,
        backgroundColor: '#203D80',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
    },
    deleteBtn: {
        padding: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
    TextInput,
    Modal,
    Image,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPlayers, savePlayers } from '../storage/Storage';
import { createPlayer } from '../models/Player';

export default function JoueurScreen() {
    const [players, setPlayers] = useState([]);
    const [newName, setNewName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        const data = await getPlayers();
        setPlayers(data);
    };

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

    const handleDeletePlayer = (id) => {
        Alert.alert(
            'Supprimer ce joueur ?',
            'Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const updated = players.filter((p) => p.id !== id);
                        setPlayers(updated);
                        await savePlayers(updated);
                    },
                },
            ]
        );
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
        <Pressable onPress={() => openStatsModal(item)} style={styles.playerCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.photoUri ? (
                    <Image source={{ uri: item.photoUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>{item.name[0]}</Text>
                    </View>
                )}
                <Text style={styles.playerName}>{item.name}</Text>
            </View>
            <Pressable onPress={() => handleDeletePlayer(item.id)}>
                <Feather name="trash-2" size={20} color="#900" />
            </Pressable>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>👤 Joueurs</Text>
            <FlatList
                data={players}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
                <AntDesign name="plus" size={30} color="#fff" />
            </Pressable>
            {/* Modal ajout joueur */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter un joueur</Text>
                        <Pressable onPress={pickImage} style={styles.avatarPicker}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarLarge} />
                            ) : (
                                <Text style={{ color: '#203D80' }}>Prendre une photo</Text>
                            )}
                        </Pressable>
                        <TextInput
                            placeholder="Nom du joueur"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <Pressable style={styles.cancelBtn} onPress={() => { setModalVisible(false); setAvatarUri(null); }}>
                                <Text style={styles.btnText}>Annuler</Text>
                            </Pressable>
                            <Pressable style={styles.confirmBtn} onPress={handleAddPlayer}>
                                <Text style={styles.btnText}>Ajouter</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Modal statistiques joueur */}
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
                                        <Text style={{ color: '#fff', fontSize: 32 }}>{selectedPlayer.name[0]}</Text>
                                    </View>
                                )}
                                <Text style={styles.statsName}>{selectedPlayer.name}</Text>
                                <Text style={styles.statsLabel}>Parties jouées : <Text style={styles.statsValue}>{selectedPlayer.gamesPlayed ?? selectedPlayer.stats?.gamesPlayed ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Victoires : <Text style={styles.statsValue}>{selectedPlayer.victories ?? selectedPlayer.stats?.gamesWon ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Gorgées bues : <Text style={styles.statsValue}>{selectedPlayer.beerDrinks ?? selectedPlayer.stats?.beersDrank ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Série de victoire : <Text style={styles.statsValue}>{selectedPlayer.winStreak ?? selectedPlayer.stats?.winStreak ?? 0}</Text></Text>
                                <Text style={styles.statsLabel}>Meilleure série : <Text style={styles.statsValue}>{selectedPlayer.bestStreak ?? selectedPlayer.stats?.bestStreak ?? 0}</Text></Text>
                                <Pressable style={styles.closeStatsBtn} onPress={closeStatsModal}>
                                    <Text style={styles.btnText}>Fermer</Text>
                                </Pressable>
                            </>
                        )}
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
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#6E3B00',
        marginBottom: 20,
        textAlign: 'center',
    },
    playerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E7F0FF',
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
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
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
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
});

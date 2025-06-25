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
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { getPlayers, savePlayers } from '../storage/Storage';

export default function JoueurScreen() {
    const [players, setPlayers] = useState([]);
    const [newName, setNewName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Chargement initial
    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        const data = await getPlayers();
        setPlayers(data);
    };

    const handleAddPlayer = async () => {
        if (!newName.trim()) return;

        const newPlayer = {
            id: Date.now().toString(),
            name: newName.trim(),
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                beersDrank: 0,
                winStreak: 0,
                bestStreak: 0,
            },
        };

        const updated = [...players, newPlayer];
        setPlayers(updated);
        await savePlayers(updated);
        setNewName('');
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

    const renderItem = ({ item }) => (
        <View style={styles.playerCard}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Pressable onPress={() => handleDeletePlayer(item.id)}>
                <Feather name="trash-2" size={20} color="#900" />
            </Pressable>
        </View>
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
                        <TextInput
                            placeholder="Nom du joueur"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Annuler</Text>
                            </Pressable>
                            <Pressable style={styles.confirmBtn} onPress={handleAddPlayer}>
                                <Text style={styles.btnText}>Ajouter</Text>
                            </Pressable>
                        </View>
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
});


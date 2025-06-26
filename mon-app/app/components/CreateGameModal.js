import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, FlatList, Pressable, Animated } from 'react-native';
import { getPlayers } from '../storage/Storage';
import { AntDesign } from '@expo/vector-icons';
import { createGame } from '../models/Game';
import { saveGames, getGames } from '../storage/Storage';
import { useNavigation } from '@react-navigation/native';

function ZoomPressable({ children, style, ...props }) {
    React.useRef(new Animated.Value(1)).current;
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

export default function CreateGameModal({ visible, onClose }) {
    const [players, setPlayers] = useState([]);
    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);
    const [selecting, setSelecting] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (visible) {
            getPlayers().then((data) => {
                const safePlayers = (Array.isArray(data) ? data : [])
                    .filter(p => p && (p.nom || p.name) && (p.id || p._id))
                    .map(p => ({
                        id: (p.id || p._id).toString(),
                        nom: p.nom || p.name,
                        avatar: p.avatar || p.photoUri || null
                    }));
                setPlayers(safePlayers);
            });
            setSelected1(null);
            setSelected2(null);
            setSelecting(null);
        }
    }, [visible]);

    const handleAddPlayer = (slot) => setSelecting(slot);
    const handleSelectPlayer = (player) => {
        if (selecting === 1) setSelected1(player);
        if (selecting === 2) setSelected2(player);
        setSelecting(null);
    };
    const availablePlayers = (slot) => {
        if (slot === 1 && selected2) return players.filter(p => p.id !== selected2.id);
        if (slot === 2 && selected1) return players.filter(p => p.id !== selected1.id);
        return players;
    };

    const handleValidate = async () => {
        if (!(selected1 && selected2)) return;
        const game = createGame([
            { id: selected1.id, name: selected1.nom },
            { id: selected2.id, name: selected2.nom },
        ]);
        const games = await getGames();
        await saveGames([...games, game]);
        onClose();
        navigation.navigate('GameScreen', { gameId: game.id });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Créer une partie</Text>
                    <View style={styles.row}>
                        <View style={styles.playerCol}>
                            <Text style={[styles.label, { color: '#203D80' }]}>{selected1 ? selected1.nom : 'Joueur 1'}</Text>
                            <ZoomPressable style={[styles.avatarCircle, { borderColor: '#203D80' }]} onPress={() => handleAddPlayer(1)}>
                                {selected1 && selected1.avatar ? (
                                    <Image source={{ uri: selected1.avatar }} style={styles.avatarImg} />
                                ) : selected1 ? (
                                    <View style={[styles.avatarInitial, { backgroundColor: '#203D80' }]}><Text style={styles.avatarInitialText}>{selected1.nom[0]}</Text></View>
                                ) : (
                                    <AntDesign name="plus" size={36} color="#203D80" />
                                )}
                            </ZoomPressable>
                        </View>
                        <View style={styles.vsCol}>
                            <View style={styles.vsBottom}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>
                        </View>
                        <View style={styles.playerCol}>
                            <Text style={[styles.label, { color: '#FF0000' }]}>{selected2 ? selected2.nom : 'Joueur 2'}</Text>
                            <ZoomPressable style={[styles.avatarCircle, { borderColor: '#FF0000' }]} onPress={() => handleAddPlayer(2)}>
                                {selected2 && selected2.avatar ? (
                                    <Image source={{ uri: selected2.avatar }} style={styles.avatarImg} />
                                ) : selected2 ? (
                                    <View style={[styles.avatarInitial, { backgroundColor: '#FF0000' }]}><Text style={styles.avatarInitialText}>{selected2.nom[0]}</Text></View>
                                ) : (
                                    <AntDesign name="plus" size={36} color="#FF0000" />
                                )}
                            </ZoomPressable>
                        </View>
                    </View>
                    {selecting && (
                        <View style={styles.selectListOverlay}>
                            <View style={styles.selectListBox}>
                                <Text style={styles.selectListTitle}>Choisir un joueur</Text>
                                {availablePlayers(selecting).length === 0 ? (
                                    <Text style={{color:'#203D80',marginVertical:20}}>Aucun joueur disponible</Text>
                                ) : (
                                <FlatList
                                    data={availablePlayers(selecting)}
                                    keyExtractor={item => item.id?.toString()}
                                    renderItem={({ item }) => (
                                        <ZoomPressable style={styles.selectListItem} onPress={() => handleSelectPlayer(item)}>
                                            {item.avatar ? (
                                                <Image source={{ uri: item.avatar }} style={styles.selectListAvatar} />
                                            ) : (
                                                <View style={styles.selectListInitial}><Text style={styles.avatarInitialText}>{item.nom ? item.nom[0] : '?'} </Text></View>
                                            )}
                                            <Text style={styles.selectListName}>{item.nom || '?'}</Text>
                                        </ZoomPressable>
                                    )}
                                />
                                )}
                                <ZoomPressable style={styles.selectListCancel} onPress={() => setSelecting(null)}>
                                    <Text style={{ color: '#203D80', fontWeight: 'bold' }}>Annuler</Text>
                                </ZoomPressable>
                            </View>
                        </View>
                    )}
                    <View style={styles.buttonRow}>
                        <ZoomPressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </ZoomPressable>
                        <ZoomPressable
                            style={[styles.validateButton, !(selected1 && selected2) && { opacity: 0.5 }]}
                            onPress={handleValidate}
                            disabled={!(selected1 && selected2)}
                        >
                            <Text style={styles.validateText}>Valider</Text>
                        </ZoomPressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const AVATAR_SIZE = 64;
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
    },
    modalContent: {
        width: 340,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 18,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 28,
        alignItems: 'center',
    },
    playerCol: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16,
        color: '#203D80',
    },
    avatarCircle: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#203D80',
    },
    avatarImg: {
        width: AVATAR_SIZE - 8,
        height: AVATAR_SIZE - 8,
        borderRadius: (AVATAR_SIZE - 8) / 2,
    },
    avatarInitial: {
        width: AVATAR_SIZE - 8,
        height: AVATAR_SIZE - 8,
        borderRadius: (AVATAR_SIZE - 8) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
    },
    avatarInitialText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 28,
    },
    selectListOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    selectListBox: {
        width: 260,
        maxHeight: 340,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
    },
    selectListTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#203D80',
        marginBottom: 10,
    },
    selectListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
    },
    selectListAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    selectListInitial: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectListName: {
        fontSize: 16,
        color: '#203D80',
    },
    selectListCancel: {
        marginTop: 10,
        alignSelf: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 18,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    validateButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: '#203D80',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#333',
        fontWeight: 'bold',
    },
    validateText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    vsCol: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 60,
        height: AVATAR_SIZE,
        display: 'flex',
        position: 'relative',
    },
    vsBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    vsText: {
        fontFamily: 'monospace',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 2,
        textAlign: 'center',
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getGames } from '../storage/Storage';

export default function HistoriqueScreen() {
    const [games, setGames] = useState([]);
    const [expanded, setExpanded] = useState({}); // {gameId: bool}

    useEffect(() => {
        (async () => {
            const allGames = await getGames();
            setGames(allGames.sort((a, b) => b.id - a.id));
        })();
    }, []);

    const toggleExpand = (gameId) => {
        setExpanded(prev => ({ ...prev, [gameId]: !prev[gameId] }));
    };

    const renderHistory = (history, players) => (
        <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Historique des scores :</Text>
            {history && history.length > 0 ? history.map((h, idx) => (
                <View key={idx} style={styles.historyRowCentered}>
                    <Text style={styles.historyTextCentered}>
                        {players[0]?.name} : <Text style={{color:'#203D80'}}>{h[players[0]?.name]}</Text> - <Text style={{color:'#FF0000'}}>{h[players[1]?.name]}</Text> : {players[1]?.name}
                    </Text>
                </View>
            )) : <Text style={styles.historyTextCentered}>Aucun coup joué</Text>}
        </View>
    );

    const renderGame = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
            <View style={styles.row}>
                <Text style={styles.date}>Le {item.date}</Text>
                <Text style={styles.score}>Score final : {item.finalScore || '-'}</Text>
            </View>
            <View style={styles.playersRow}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <Text style={styles.playerName}>{item.players[0]?.name}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.vs}>vs</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={[styles.playerName, styles.playerNameRed]}>{item.players[1]?.name}</Text>
                </View>
            </View>
            {expanded[item.id] && renderHistory(item.history, item.players)}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historique des parties</Text>
            <FlatList
                data={games}
                keyExtractor={item => item.id}
                renderItem={renderGame}
                contentContainerStyle={{ paddingBottom: 30 }}
                ListEmptyComponent={<Text style={styles.empty}>Aucune partie enregistrée</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        paddingTop: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 18,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 18,
        marginVertical: 8,
        marginHorizontal: 16,
        width: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    date: {
        fontSize: 16,
        color: '#888',
        fontWeight: '600',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#203D80',
    },
    playerNameRed: {
        color: '#FF0000',
    },
    vs: {
        fontSize: 16,
        color: '#888',
        marginHorizontal: 4,
    },
    playersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        width: '100%',
    },
    historyContainer: {
        marginTop: 12,
        backgroundColor: '#F3F6FA',
        borderRadius: 8,
        padding: 10,
    },
    historyTitle: {
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 6,
        fontSize: 15,
        textAlign: 'center',
        width: '100%',
    },
    historyRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    historyText: {
        fontSize: 15,
        color: '#333',
    },
    historyRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 2,
    },
    historyTextCentered: {
        fontSize: 15,
        color: '#333',
        textAlign: 'center',
        width: '100%',
    },
    empty: {
        marginTop: 40,
        color: '#888',
        fontSize: 18,
        textAlign: 'center',
    },
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGames } from '../storage/Storage';

export default function GameScreen({ route }) {
    const [game, setGame] = React.useState(null);
    React.useEffect(() => {
        async function loadGame() {
            const games = await getGames();
            const found = games.find(g => g.id === route.params?.gameId);
            setGame(found);
        }
        loadGame();
    }, [route.params?.gameId]);

    if (!game) {
        return <View style={styles.container}><Text>Chargement...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Partie du {new Date(game.date).toLocaleString()}</Text>
            <View style={styles.playersRow}>
                <Text style={styles.player}>{game.players[0]?.name}</Text>
                <Text style={styles.vs}>VS</Text>
                <Text style={styles.player}>{game.players[1]?.name}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF8EA',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#203D80',
    },
    playersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    player: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#C25E00',
        marginHorizontal: 20,
    },
    vs: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#203D80',
    },
    info: {
        marginTop: 20,
        color: '#888',
    },
});


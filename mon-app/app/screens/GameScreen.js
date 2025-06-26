import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getGames, getPlayers } from '../storage/Storage';

export default function GameScreen({ route }) {
    const [game, setGame] = useState(null);
    const [scores, setScores] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 6 bleus, 6 rouges
    const [history, setHistory] = useState([]); // [{index, value}]

    // Score local pour affichage (somme des palets bleus et rouges)
    const [blueScore, setBlueScore] = useState(0);
    const [redScore, setRedScore] = useState(0);
    const [playerAvatars, setPlayerAvatars] = useState([null, null]);

    useEffect(() => {
        setBlueScore(scores.slice(0,6).reduce((a,b)=>a+b,0));
        setRedScore(scores.slice(6,12).reduce((a,b)=>a+b,0));
    }, [scores]);

    useEffect(() => {
        async function loadGame() {
            const games = await getGames();
            const found = games.find(g => g.id === route.params?.gameId);
            setGame(found);
        }
        loadGame();
    }, [route.params?.gameId]);

    useEffect(() => {
        async function fetchAvatars() {
            if (!game) return;
            const allPlayers = await getPlayers();
            const avatar1 = allPlayers.find(p => p.id === game.players[0]?.id)?.photoUri || null;
            const avatar2 = allPlayers.find(p => p.id === game.players[1]?.id)?.photoUri || null;
            setPlayerAvatars([avatar1, avatar2]);
        }
        fetchAvatars();
    }, [game]);

    const handleAddScore = (index, value) => {
        const newScores = [...scores];
        newScores[index] += value;
        setScores(newScores);
        setHistory([...history, { index, value }]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        const newScores = [...scores];
        newScores[last.index] -= last.value;
        setScores(newScores);
        setHistory(history.slice(0, -1));
    };

    if (!game) {
        return <View style={styles.container}><Text>Chargement...</Text></View>;
    }

    // Palets en 2 lignes de 3 pour chaque couleur
    const bluePaletImages = [
        require('../assets/images/b1.png'),
        require('../assets/images/b2.png'),
        require('../assets/images/b3.png'),
        require('../assets/images/b4.png'),
        require('../assets/images/b5.png'),
        require('../assets/images/b6.png'),
    ];
    const redPaletImages = [
        require('../assets/images/r1.png'),
        require('../assets/images/r2.png'),
        require('../assets/images/r3.png'),
        require('../assets/images/r4.png'),
        require('../assets/images/r5.png'),
        require('../assets/images/r6.png'),
    ];

    const bluePaletsRows = [
        [0,1].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i, i+1)}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [2,3].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i, i+1)}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [4,5].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i, i+1)}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
    ];
    const redPaletsRows = [
        [0,1].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i+6, i+1)}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [2,3].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i+6, i+1)}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [4,5].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => handleAddScore(i+6, i+1)}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
    ];

    return (
        <View style={styles.container}>
            <View style={styles.playersRow}>
                <View style={styles.playerBlock}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={styles.playerName}>{game.players[0]?.name}</Text>
                        {playerAvatars[0] && (
                            <Image source={{ uri: playerAvatars[0] }} style={styles.avatar} />
                        )}
                    </View>
                    <Text style={styles.totalScore}>{blueScore}</Text>
                </View>
                <View style={styles.playerBlock}>
                    <View style={{flexDirection:'row-reverse', alignItems:'center'}}>
                        <Text style={styles.playerName}>{game.players[1]?.name}</Text>
                        {playerAvatars[1] && (
                            <Image source={{ uri: playerAvatars[1] }} style={styles.avatar} />
                        )}
                    </View>
                    <Text style={styles.totalScore}>{redScore}</Text>
                </View>
            </View>
            <View style={styles.paletsRow}>
                <View style={{flex:1, alignItems:'center'}}>
                    {bluePaletsRows.map((row, idx) => (
                        <View key={idx} style={{flexDirection:'row', marginBottom:4}}>
                            {row.map((palet, j) => (
                                <View key={j} style={{marginHorizontal:5}}>{palet}</View>
                            ))}
                        </View>
                    ))}
                </View>
                <View style={{width:20}} />
                <View style={{flex:1, alignItems:'center'}}>
                    {redPaletsRows.map((row, idx) => (
                        <View key={idx} style={{flexDirection:'row', marginBottom:4}}>
                            {row.map((palet, j) => (
                                <View key={j} style={{marginHorizontal:5}}>{palet}</View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
            <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
                <Text style={styles.undoText}>⟵ Annuler</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    playersRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '90%',
        marginTop: 20,
        marginBottom: 0,
    },
    playerBlock: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
    },
    playerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#203D80',
        marginBottom: 0,
    },
    totalScore: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#203D80',
        marginTop: 2,
        marginBottom: 8,
        textAlign: 'center',
    },
    scoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    paletsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    paletCol: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    paletScoreBlock: {
        alignItems: 'center',
        marginVertical: 4,
    },
    paletScoreImg: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    paletScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#203D80',
        marginTop: 2,
    },
    plancheImage: {
        width: 220,
        height: 320,
        resizeMode: 'contain',
        marginHorizontal: 10,
    },
    undoButton: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    undoText: {
        color: '#203D80',
        fontSize: 20,
        fontWeight: 'bold',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 8,
        marginRight: 8,
    },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { getGames, getPlayers, saveGames, deleteGame } from '../storage/Storage';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function GameScreen({ route }) {
    const [game, setGame] = useState(null);
    const [scores, setScores] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 6 bleus, 6 rouges
    const [history, setHistory] = useState([]); // [{index, value}]

    // Score local pour affichage (somme des palets bleus et rouges)
    const [blueScore, setBlueScore] = useState(0);
    const [redScore, setRedScore] = useState(0);
    const [playerAvatars, setPlayerAvatars] = useState([null, null]);
    const navigation = useNavigation();
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [showExplosion, setShowExplosion] = useState(false);
    const [explosionKey, setExplosionKey] = useState(0);
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [winner, setWinner] = useState(null);
    const [looser, setLooser] = useState(null);

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

    useEffect(() => {
        navigation.setOptions({
            header: () => <CustomHeader onHomePress={handleHomePress} />
        });
    }, [navigation]);

    const handleAddScore = async (index, value) => {
        const newScores = [...scores];
        newScores[index] += value;
        setScores(newScores);
        setHistory([...history, { index, value }]);
        // Mise à jour du score du joueur dans game + ajout à l'historique
        if (game) {
            let updatedPlayers = [...game.players];
            if (index < 6) {
                updatedPlayers[0] = { ...updatedPlayers[0], score: newScores.slice(0,6).reduce((a,b)=>a+b,0) };
            } else {
                updatedPlayers[1] = { ...updatedPlayers[1], score: newScores.slice(6,12).reduce((a,b)=>a+b,0) };
            }
            // Ajout du score actuel à l'historique avec les noms des joueurs
            const newHistory = [
                ...(game.history || []),
                {
                    [game.players[0]?.name || 'Joueur 1']: newScores.slice(0,6).reduce((a,b)=>a+b,0),
                    [game.players[1]?.name || 'Joueur 2']: newScores.slice(6,12).reduce((a,b)=>a+b,0)
                }
            ];
            const updatedGame = { ...game, players: updatedPlayers, history: newHistory };
            setGame(updatedGame);
            // Sauvegarde immédiate
            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, updatedGame]);
        }
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        const newScores = [...scores];
        newScores[last.index] -= last.value;
        setScores(newScores);
        setHistory(history.slice(0, -1));
        // Mise à jour du score du joueur dans game + suppression du dernier score de l'historique
        if (game) {
            let updatedPlayers = [...game.players];
            if (last.index < 6) {
                updatedPlayers[0] = { ...updatedPlayers[0], score: newScores.slice(0,6).reduce((a,b)=>a+b,0) };
            } else {
                updatedPlayers[1] = { ...updatedPlayers[1], score: newScores.slice(6,12).reduce((a,b)=>a+b,0) };
            }
            // Suppression du dernier score de l'historique
            const newHistory = (game.history || []).slice(0, -1);
            const updatedGame = { ...game, players: updatedPlayers, history: newHistory };
            setGame(updatedGame);
            // Sauvegarde immédiate
            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, updatedGame]);
        }
    };

    const handleHomePress = () => {
        setShowQuitModal(true);
    };
    const confirmQuit = async () => {
        setShowQuitModal(false);
        // Suppression de la partie du stockage
        if (game && game.id) {
            await deleteGame(game.id);
        }
        navigation.navigate('Accueil');
    };
    const cancelQuit = () => {
        setShowQuitModal(false);
    };

    // Explosion rainbow flags
    const explosionAnim = useRef([
        ...Array(7)
    ].map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1)
    }))).current;

    const explosionVectors = [
        { x: 0, y: -80 }, // haut
        { x: 60, y: -60 }, // haut droite
        { x: 80, y: 0 }, // droite
        { x: 60, y: 60 }, // bas droite
        { x: 0, y: 80 }, // bas
        { x: -60, y: 60 }, // bas gauche
        { x: -80, y: 0 }, // gauche
    ];

    const triggerExplosion = () => {
        setShowExplosion(true);
        setExplosionKey(Date.now());
        explosionAnim.forEach((anim) => {
            anim.x.setValue(0);
            anim.y.setValue(0);
            anim.opacity.setValue(1);
        });
        Animated.stagger(30, explosionAnim.map((anim, i) =>
            Animated.parallel([
                Animated.timing(anim.x, {
                    toValue: explosionVectors[i].x,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.y, {
                    toValue: explosionVectors[i].y,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                })
            ])
        )).start(() => setShowExplosion(false));
    };

    // Détection de la victoire et gestion winner/finalScore
    useEffect(() => {
        if (!game) return;
        let winnerIndex = null;
        if (blueScore >= 13) winnerIndex = 0;
        else if (redScore >= 13) winnerIndex = 1;

        if (winnerIndex !== null) {
            // Met à jour winner et finalScore dans l'objet game (mais ne sauvegarde pas)
            const loserIndex = winnerIndex === 0 ? 1 : 0;
            const winnerScore = winnerIndex === 0 ? blueScore : redScore;
            const loserScore = winnerIndex === 0 ? redScore : blueScore;
            setWinner({ name: game?.players[winnerIndex]?.name, score: winnerScore });
            setLooser({ name: game?.players[loserIndex]?.name, score: loserScore });
            setShowVictoryModal(true);
            setGame(g => ({
                ...g,
                players: [
                    { ...g.players[0], score: blueScore },
                    { ...g.players[1], score: redScore }
                ],
                finalScore: `${blueScore} - ${redScore}`,
                winner: g.players[winnerIndex]?.name || null,
            }));
        } else {
            // Si le score repasse sous 13, on remet winner et finalScore à null et on ferme la modale
            if (game.winner || game.finalScore) {
                setWinner(null);
                setLooser(null);
                setShowVictoryModal(false);
                setGame(g => ({
                    ...g,
                    players: [
                        { ...g.players[0], score: blueScore },
                        { ...g.players[1], score: redScore }
                    ],
                    finalScore: null,
                    winner: null,
                }));
            }
        }
    }, [blueScore, redScore]);

    // Bouton Terminer : sauvegarde la partie et affiche les données dans la console
    const handleVictoryConfirm = async () => {
        if (game) {
            const finishedGame = {
                ...game,
            };
            console.log('GAME TERMINEE:', finishedGame);
            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, finishedGame]);
        }
        setShowVictoryModal(false);
        navigation.navigate('Accueil');
    };

    // DEBUG : Affiche toutes les games du storage dans la console
    useEffect(() => {
        (async () => {
            const games = await getGames();
            console.log('TOUTES LES GAMES DU STORAGE:', games);
        })();
    }, []);

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
            <ConfirmDeleteModal
                visible={showQuitModal}
                onCancel={cancelQuit}
                onConfirm={confirmQuit}
                title="Quitter la partie ?"
                message="La partie en cours ne sera pas enregistrée. Êtes-vous sûr de vouloir quitter ?"
                confirmText="Quitter"
                cancelText="Annuler"
            />
            {showVictoryModal && (
                <View style={styles.victoryModal}>
                    <View style={styles.victoryContent}>
                        <Text style={styles.victoryText}>Victoire de {winner?.name} !</Text>
                        <Text style={styles.victoryScore}>Score : {winner?.score} - {looser?.score}</Text>
                        <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', marginTop:10}}>
                            <TouchableOpacity style={[styles.victoryCancelBtn, {flex:1, marginRight:5}]} onPress={() => setShowVictoryModal(false)}>
                                <Text style={styles.victoryBtnText}>Retour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.victoryConfirmBtn, {flex:1, marginLeft:5}]} onPress={handleVictoryConfirm}>
                                <Text style={styles.victoryBtnText}>Terminer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
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
                        <Text style={[styles.playerName, styles.playerNameRed]}>{game.players[1]?.name}</Text>
                        {playerAvatars[1] && (
                            <Image source={{ uri: playerAvatars[1] }} style={styles.avatar} />
                        )}
                    </View>
                    <Text style={[styles.totalScore, styles.totalScoreRed]}>{redScore}</Text>
                </View>
            </View>
            <View style={{alignItems:'center', justifyContent:'flex-start'}}>
                <Image source={require('../assets/images/planche.png')} style={styles.plancheImage} />
            </View>
            <View style={styles.paletsRow}>
                <View style={{flex:1, alignItems:'center'}}>
                    {bluePaletsRows.map((row, idx) => (
                        <View key={idx} style={{flexDirection:'row', marginBottom:4, marginLeft:22}}>
                            {row.map((palet, j) => (
                                <View key={j} style={{marginHorizontal:5}}>{palet}</View>
                            ))}
                        </View>
                    ))}
                </View>
                <View style={{flex:1, alignItems:'center'}}>
                    {redPaletsRows.map((row, idx) => (
                        <View key={idx} style={{flexDirection:'row', marginBottom:4, marginRight:22}}>
                            {row.map((palet, j) => (
                                <View key={j} style={{marginHorizontal:5}}>{palet}</View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
            <View style={{position:'absolute', left:0, right:0, alignItems:'center', bottom:30}}>
                <LinearGradient
                    colors={['#FFB3B3', '#B3FFB3', '#B3B3FF', '#FFFFB3', '#FFB3FF', '#B3FFFF', '#FFB3B3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={{alignItems:'center', justifyContent:'center'}}>
                        <TouchableOpacity
                            style={styles.undoButton}
                            onPress={() => { handleUndo(); triggerExplosion(); }}
                            disabled={blueScore === 0 && redScore === 0}
                        >
                            <Text style={[styles.undoText, (blueScore === 0 && redScore === 0) && {opacity:0.5}]}>🏳️‍🌈 Erreur de zouzou 🏳️‍🌈</Text>
                        </TouchableOpacity>
                        {showExplosion && (
                            <View style={styles.explosionOverlay} pointerEvents="none" key={explosionKey}>
                                {explosionAnim.map((anim, i) => (
                                    <Animated.Text
                                        key={i}
                                        style={[styles.explosionText, {
                                            transform: [
                                                { translateX: anim.x },
                                                { translateY: anim.y },
                                            ],
                                            opacity: anim.opacity,
                                        }]}
                                    >
                                        🏳️‍🌈
                                    </Animated.Text>
                                ))}
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        justifyContent: 'flex-start',
        userSelect: 'none',
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
    playerNameRed: {
        color: '#FF0000',
    },
    totalScore: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#203D80',
        marginTop: 2,
        textAlign: 'center',
    },
    totalScoreRed: {
        color: '#FF0000',
    },
    scoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 10,
    },
    paletsRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        width: 65,
        height: 65,
        resizeMode: 'contain',
    },
    paletScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#203D80',
        marginTop: 2,
    },
    plancheImage: {
        width: 250,
        height: 350,
        resizeMode: 'contain',
    },
    gradientBorder: {
        padding: 3,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    undoButton: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        minWidth: 180,
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
    explosionContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    explosionOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    explosionText: {
        position: 'absolute',
        fontSize: 24,
        lineHeight: 24,
    },
    victoryModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        paddingHorizontal: 24, // Ajoute un espacement sur les côtés
    },
    victoryContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 220,
        maxWidth: 400,
        width: '100%',
        elevation: 5,
    },
    victoryText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#203D80',
    },
    victoryScore: {
        fontSize: 20,
        marginBottom: 20,
        color: '#203D80',
    },
    victoryCancelBtn: {
        backgroundColor: '#999',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    victoryConfirmBtn: {
        backgroundColor: '#203D80',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    victoryBtnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
    },
});

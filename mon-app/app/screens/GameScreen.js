import React, { useEffect, useState, useRef } from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Animated, Modal} from 'react-native';
import { getGames, getPlayers, saveGames, deleteGame, savePlayers, getRules } from '../storage/Storage';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from '../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import {Audio} from "expo-av";

export default function GameScreen({ route }) {
    const [game, setGame] = useState(null);
    const [scores, setScores] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 6 bleus, 6 rouges
    const [history, setHistory] = useState([]); // [{index, value}]

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
    const [rules, setRules] = useState([]);
    const [activeRule, setActiveRule] = useState(null);
    const [ruleModalType, setRuleModalType] = useState(null);
    const [modalRuleScores, setModalRuleScores] = useState({blue: 0, red: 0});
    const [modaleInfo, setModaleInfo] = useState(true);

    useEffect(() => {
        async function loadRules() {
            const loadedRules = await getRules();
            setRules(loadedRules.filter(r => r.active));
        }
        loadRules();
    }, []);

    useEffect(() => {
        setBlueScore(scores.slice(0,6).reduce((a,b)=>a+b,0));
        setRedScore(scores.slice(6,12).reduce((a,b)=>a+b,0));
    }, [scores]);

    useEffect(() => {
        async function loadGame() {
            const games = await getGames();
            const found = games.find(g => g.id === route.params?.gameId);
            if (found && found.players) {
                found.players = found.players.map(p => ({
                    ...p,
                    sips: typeof p.sips === 'number' ? p.sips : 0
                }));
            }
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

    useEffect(() => {
        if(ruleModalType === "scoreBased" || ruleModalType === "egalite" || ruleModalType === "selectPlayer") {
            playSound(1);
        }
    }, [ruleModalType]);

    function incrementPlayerSips(index, count) {
        setGame(prev => {
            const updated = {...prev};
            updated.players = [...updated.players];
            updated.players[index] = {...updated.players[index]};
            updated.players[index].sips += count;
            return updated;
        });
    }

    async function playSound(soundIndex) {
        const sounds = [
            require('../assets/sounds/gay.mp3'),
            require('../assets/sounds/beer.mp3'),
            require('../assets/sounds/palet.mp3'),
        ];

        if (soundIndex < 0 || soundIndex >= sounds.length) {
            console.error('Index de son invalide');
            return;
        }

        const { sound } = await Audio.Sound.createAsync(sounds[soundIndex]);
        await sound.playAsync();
    }

    function scoresMatchPattern(blueScore, redScore, pattern) {
        const match = /^(\d+)\s*-\s*(\d+)$/.exec(pattern);
        if (match) {
            const x = parseInt(match[1], 10);
            const y = parseInt(match[2], 10);
            return ((blueScore === x && redScore === y) || (blueScore === y && redScore === x));
        }
        if (/^[eé]galité$/i.test(pattern)) {
            return blueScore === redScore;
        }
        if (/^\d+$/.test(pattern)) {
            return blueScore === parseInt(pattern, 10) || redScore === parseInt(pattern, 10);
        }
        return false;
    }

    const handleAddScore = async (index, value) => {
        const newScores = [...scores];
        const playerCurrentScore = index < 6
            ? newScores.slice(0, 6).reduce((a, b) => a + b, 0)
            : newScores.slice(6, 12).reduce((a, b) => a + b, 0);

        if (playerCurrentScore >= 13) {
            return;
        }

        newScores[index] += value;

        let newBlueScore = newScores.slice(0,6).reduce((a,b)=>a+b,0);
        let newRedScore = newScores.slice(6,12).reduce((a,b)=>a+b,0);

        const foundRule = rules.find(rule => rule.active && scoresMatchPattern(newBlueScore, newRedScore, rule.scorePattern));

        let sipsGiven = [];

        if (foundRule) {
            setActiveRule(foundRule);

            if (foundRule.sips === "Gorgées selon le score") {
                setRuleModalType("scoreBased");
                setModalRuleScores({blue: newBlueScore, red: newRedScore});
                sipsGiven = [
                    { playerIdx: 0, sips: newBlueScore },
                    { playerIdx: 1, sips: newRedScore }
                ];
            } else if (foundRule.scorePattern && /^[eé]galité$/i.test(foundRule.scorePattern)) {
                setRuleModalType("egalite");
                setModalRuleScores({blue: 1, red: 1});
                sipsGiven = [
                    { playerIdx: 0, sips: 1 },
                    { playerIdx: 1, sips: 1 }
                ];
            } else {
                setRuleModalType("selectPlayer");
                setModalRuleScores({blue: null, red: null});
            }
        }

        setScores(newScores);
        setHistory([...history, { index, value, sipsGiven }]);

        if (game) {
            let updatedPlayers = [...game.players];
            if (index < 6) {
                updatedPlayers[0] = { ...updatedPlayers[0], score: newScores.slice(0,6).reduce((a,b)=>a+b,0) };
            } else {
                updatedPlayers[1] = { ...updatedPlayers[1], score: newScores.slice(6,12).reduce((a,b)=>a+b,0) };
            }
            const newHistory = [
                ...(game.history || []),
                {
                    [game.players[0]?.name || 'Joueur 1']: newScores.slice(0,6).reduce((a,b)=>a+b,0),
                    [game.players[1]?.name || 'Joueur 2']: newScores.slice(6,12).reduce((a,b)=>a+b,0)
                }
            ];
            const updatedGame = { ...game, players: updatedPlayers, history: newHistory };
            setGame(updatedGame);
            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, updatedGame]);
        }
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];

        let updatedPlayers = [...game.players];

        if (last.sipsGiven && last.sipsGiven.length > 0) {
            last.sipsGiven.forEach(({ playerIdx, sips }) => {
                updatedPlayers[playerIdx] = {
                    ...updatedPlayers[playerIdx],
                    sips: Math.max(0, (updatedPlayers[playerIdx].sips || 0) - (sips || 0))
                };
            });
        }

        const newScores = [...scores];
        newScores[last.index] -= last.value;
        setScores(newScores);

        if (game) {
            if (last.index < 6) {
                updatedPlayers[0] = { ...updatedPlayers[0], score: newScores.slice(0,6).reduce((a,b)=>a+b,0) };
            } else {
                updatedPlayers[1] = { ...updatedPlayers[1], score: newScores.slice(6,12).reduce((a,b)=>a+b,0) };
            }

            const newHistory = (game.history || []).slice(0, -1);
            const updatedGame = { ...game, players: updatedPlayers, history: newHistory };

            setGame(updatedGame);
            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, updatedGame]);
        }

        setHistory(history.slice(0, -1));
    };

    const handleHomePress = () => {
        setShowQuitModal(true);
    };
    const confirmQuit = async () => {
        setShowQuitModal(false);
        if (game && game.id) {
            await deleteGame(game.id);
        }
        navigation.navigate('Accueil');
    };
    const cancelQuit = () => {
        setShowQuitModal(false);
    };

    const explosionAnim = useRef([
        ...Array(7)
    ].map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1)
    }))).current;

    const explosionVectors = [
        { x: 0, y: -80 },
        { x: 60, y: -60 },
        { x: 80, y: 0 },
        { x: 60, y: 60 },
        { x: 0, y: 80 },
        { x: -60, y: 60 },
        { x: -80, y: 0 },
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

    useEffect(() => {
        if (!game) return;
        let winnerIndex = null;
        if (blueScore >= 13) winnerIndex = 0;
        else if (redScore >= 13) winnerIndex = 1;

        if (winnerIndex !== null) {
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

    const handleVictoryConfirm = async () => {
        if (game) {
            const finishedGame = {...game,};

            const winnerId = game.players.find(p => p.name === game.winner)?.id;
            const loserId = game.players.find(p => p.id !== winnerId)?.id;
            let allPlayers = await getPlayers();

            const sipsById = {};
            game.players.forEach(p => { sipsById[p.id] = p.sips; });

            allPlayers = allPlayers.map(player => {
                if (player.id === winnerId) {
                    const newWinStreak = (player.winStreak || 0) + 1;
                    return {
                        ...player,
                        gamesPlayed: (player.gamesPlayed || 0) + 1,
                        victories: (player.victories || 0) + 1,
                        winStreak: newWinStreak,
                        bestStreak: Math.max(newWinStreak, player.bestStreak || 0),
                        sipDrinks: player.sipDrinks + sipsById[player.id]
                    };
                } else if (player.id === loserId) {
                    return {
                        ...player,
                        gamesPlayed: (player.gamesPlayed || 0) + 1,
                        winStreak: 0,
                        sipDrinks: player.sipDrinks + sipsById[player.id]
                    };
                } else {
                    return player;
                }
            });
            await savePlayers(allPlayers);

            const games = await getGames();
            const others = games.filter(g => g.id !== game.id);
            await saveGames([...others, finishedGame]);
        }
        setShowVictoryModal(false);
        navigation.navigate('Accueil');
    };

    if (!game) {
        return <View style={styles.container}><Text>Chargement...</Text></View>;
    }

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
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i, i+1); playSound(2); }}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [2,3].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i, i+1); playSound(2); }}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [4,5].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i, i+1); playSound(2); }}>
                <Image source={bluePaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
    ];
    const redPaletsRows = [
        [0,1].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i+6, i+1); playSound(2); }}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [2,3].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i+6, i+1); playSound(2); }}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
        [4,5].map(i => (
            <TouchableOpacity key={i} style={styles.paletScoreBlock} onPress={() => { handleAddScore(i+6, i+1); playSound(2); }}>
                <Image source={redPaletImages[i]} style={styles.paletScoreImg} />
            </TouchableOpacity>
        )),
    ];

    return (
        <View style={styles.container}>
                <Modal
                    animationType="fade"
                    transparent
                    visible={modaleInfo}
                    onRequestClose={() => setModalInfo(false)}
                >
                    <View style={styles.victoryModal}>
                        <View style={styles.modaleInfo}>
                            <View style={styles.infoModale}>
                                <Text style={styles.infoTitre}>Comment jouer ?</Text>
                                <Text style={styles.sectionTxt}>1. Compter les points</Text>
                                    <Text style={styles.infoTxt}>
                                        Pour chaque équipe, des palets sont identifiés de 1 à 6.
                                        Lorsque votre équipe marque un score, il suffit d’appuyer sur le palet correspondant à son numéro (rouge pour l’équipe rouge, bleu pour l’équipe bleue). Le score de l’équipe s’incrémente automatiquement.
                                    </Text>
                                <Text style={styles.sectionTxt}>2. Corriger une erreur</Text>
                                    <Text style={styles.infoTxt}>
                                        Si une erreur s’est produite dans le comptage des points (miss click), utilisez le bouton “Erreur de zouzou” en bas de l’écran pour annuler la dernière action et corriger le score.
                                    </Text>
                                <Text style={styles.sectionTxt}>3. Règles spéciales</Text>
                                    <Text style={styles.infoTxt}>
                                        Certaines règles peuvent être paramétrées et activées avant la partie dans la page "Règles".
                                        Dès que le score d’une équipe atteint l’une des valeurs paramétrées, la règle correspondante s’affichera automatiquement dans une popup, indiquant le nombre de gorgées à boire.
                                    </Text>
                                <Text style={styles.sectionTxt}>4. Gagner la partie</Text>
                                    <Text style={styles.infoTxt}>
                                        La première équipe à atteindre 13 points remporte la victoire !
                                    </Text>
                            </View>
                            <TouchableOpacity style={styles.commencerBtn} onPress={() => setModaleInfo(false)}><Text style={styles.commencerTxt}>Commencer la partie</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            <ConfirmDeleteModal
                visible={showQuitModal}
                onCancel={cancelQuit}
                onConfirm={confirmQuit}
                title="Quitter la partie ?"
                message="La partie en cours ne sera pas enregistrée. Êtes-vous sûr de vouloir quitter ?"
                confirmText="Quitter"
                cancelText="Annuler"
            />
                <Modal
                    animationType="fade"
                    transparent
                    visible={showVictoryModal}
                    onRequestClose={() => setShowVictoryModal(false)}
                >
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
                </Modal>
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
                            onPress={() => { playSound(0); handleUndo(); triggerExplosion(); }}
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
            {ruleModalType === "scoreBased" && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={true}
                    onRequestClose={() => setRuleModalType(null)}
                >
                    <View style={styles.victoryModal}>
                        <View style={styles.victoryContent}>
                            <Text style={styles.scoreTitre}>{activeRule.title}</Text>
                            <Text style={styles.scoreText}>{game.players[0].score} - {game.players[1].score}</Text>
                            <Text style={styles.victoryScore}>
                                <Text style={{color: '#1856A5'}}>{game.players[0].name}</Text> boit {modalRuleScores.blue} gorgées{'\n'}
                                <Text style={{color: '#D33E43'}}>{game.players[1].name}</Text> boit {modalRuleScores.red} gorgées
                            </Text>
                            <TouchableOpacity
                                style={styles.scoreBtn}
                                onPress={() => {
                                    incrementPlayerSips(0, modalRuleScores.blue);
                                    incrementPlayerSips(1, modalRuleScores.red);
                                    setHistory(history => {
                                        if (!history.length) return history;
                                        const last = history[history.length - 1];
                                        return [
                                            ...history.slice(0, -1),
                                            { ...last, sipsGiven: [
                                                    { playerIdx: 0, sips: modalRuleScores.blue },
                                                    { playerIdx: 1, sips: modalRuleScores.red }
                                                ]}
                                        ];
                                    });
                                    setActiveRule(null); setRuleModalType(null);                            }}
                            >
                                <Text style={styles.victoryBtnText}>C'est bu !</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            {ruleModalType === "selectPlayer" && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={true}
                    onRequestClose={() => setRuleModalType(null)}
                >
                    <View style={styles.victoryModal}>
                        <View style={styles.victoryContent}>
                            <Text style={styles.scoreTitre}>{activeRule.title}</Text>
                            <Text style={styles.scoreText}>{game.players[0].score} - {game.players[1].score}</Text>
                            <Text style={styles.victoryScore}>{activeRule.sips}{'\n'}pour :</Text>
                            <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                {[0, 1].map(idx => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[
                                            styles.scoreJoueurBtn,
                                            {
                                                flex: 1,
                                                marginLeft: idx === 1 ? 5 : 0,
                                                marginRight: idx === 0 ? 5 : 0,
                                                backgroundColor: idx === 0 ? "#1856A5" : "#D33E43"
                                            }
                                        ]}
                                        onPress={() => {
                                            let sips = activeRule.sips === "Cul sec !" ? 10 : parseInt(activeRule.sips, 10) || 1;
                                            incrementPlayerSips(idx, sips);
                                            setHistory(history => {
                                                if (!history.length) return history;
                                                const last = history[history.length - 1];
                                                return [
                                                    ...history.slice(0, -1),
                                                    { ...last, sipsGiven: [{ playerIdx: idx, sips }] }
                                                ];
                                            });
                                            setActiveRule(null);
                                            setRuleModalType(null);
                                        }}
                                    >
                                        <Text style={styles.victoryBtnText}>{game.players[idx].name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {ruleModalType === "egalite" && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={true}
                    onRequestClose={() => setRuleModalType(null)}
                >
                    <View style={styles.victoryModal}>
                        <View style={styles.victoryContent}>
                            <Text style={styles.scoreTitre}>{activeRule?.title || "RENCONTRE !"}</Text>
                            <Text style={styles.scoreText}>{game.players[0].score} - {game.players[1].score}</Text>
                            <Text style={styles.victoryScore}>
                                Tout le monde boit la gorgée de l'amitié !
                            </Text>
                            <TouchableOpacity
                                style={styles.scoreBtn}
                                onPress={() => {
                                    incrementPlayerSips(0, 1);
                                    incrementPlayerSips(1, 1);
                                    setHistory(history => {
                                        if (!history.length) return history;
                                        const last = history[history.length - 1];
                                        return [
                                            ...history.slice(0, -1),
                                            { ...last, sipsGiven: [
                                                    { playerIdx: 0, sips: 1 },
                                                    { playerIdx: 1, sips: 1 }
                                                ]}
                                        ];
                                    });
                                    setActiveRule(null);
                                    setRuleModalType(null);
                                }}
                            >
                                <Text style={styles.victoryBtnText}>C'est bu !</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
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
        width: 240,
        height: 340,
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
        paddingHorizontal: 24,
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
        color: '#000',
    },
    victoryScore: {
        fontSize: 20,
        marginBottom: 20,
        color: '#000',
        textAlign: 'center',
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
    scoreTitre: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    scoreText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    scoreJoueurBtn: {
        padding: 10,
        borderRadius: 10,
        flex: 1,
        width: '160px',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    scoreBtn: {
        backgroundColor: '#999',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
    },
    modaleInfo: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 25,
        paddingHorizontal: 30,
        alignItems: 'center',
        width: '100%',
        height: '94%',
        elevation: 8,
        zIndex: 11,
    },
    infoModale: {
        flex: 12,
    },
    infoTitre: {
        marginTop: 10,
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionTxt: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: 15,
        marginBottom: 5,
    },
    infoTxt: {
        fontSize: 18,
        textAlign: 'justify',
    },
    commencerBtn: {
        flex: 1,
        backgroundColor: '#203D80',
        borderRadius: 10,
        justifyContent: 'center',
    },
    commencerTxt: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 30,
        margin: 0,
        padding: 0,
    },
});

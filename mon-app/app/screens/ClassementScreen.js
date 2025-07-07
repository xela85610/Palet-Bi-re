import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, StyleSheet, Image, ActivityIndicator, Pressable} from 'react-native';
import { getPlayers } from '../storage/Storage';

const ClassementScreen = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('gamesPlayed');

    useEffect(() => {
        const fetchPlayers = async () => {
            const storedPlayers = await getPlayers();
            setPlayers(storedPlayers);
            setLoading(false);
        };

        fetchPlayers();
    }, []);

    const sortedPlayers = [...players].sort((a, b) => {
        console.log("tous les joueurs" + players);
        console.log(players);

        if (activeTab === 'sipDrinks') {
            return b.sipDrinks - a.sipDrinks;
        } else {
            return b[activeTab] - a[activeTab];
        }
    });
    console.log("trié" + sortedPlayers);
    console.log(sortedPlayers);


    const renderItem = ({ item, index }) => (
        <View style={styles.playerRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.playerImage} />
            ) : (
                <View style={[styles.placeholderAvatar, { backgroundColor: item.color || '#ccc' }]}>
                    <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
                </View>
            )}
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.playerStat}>{item[activeTab]}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Classements</Text>
            <View style={styles.tabContainer}>
                <Pressable
                    onPress={() => switchTab('gamesPlayed')}
                    style={[styles.tab, activeTab === 'gamesPlayed' && styles.activeTab]}
                >
                    <Text style={activeTab === 'gamesPlayed' ? styles.activeTabText : styles.tabText}>Parties
                        Jouées</Text>
                </Pressable>
                <Pressable
                    onPress={() => switchTab('victories')}
                    style={[styles.tab, activeTab === 'victories' && styles.activeTab]}
                >
                    <Text style={activeTab === 'victories' ? styles.activeTabText : styles.tabText}>Victoires</Text>
                </Pressable>
                <Pressable
                    onPress={() => switchTab('sipDrinks')}
                    style={[styles.tab, activeTab === 'sipDrinks' && styles.activeTab]}
                >
                    <Text style={activeTab === 'sipDrinks' ? styles.activeTabText : styles.tabText}>Gorgées bues</Text>
                </Pressable>
            </View>

            <View style={styles.playersContainer}>
                <FlatList
                    data={sortedPlayers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        padding: 10,
        userSelect: 'none',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 10,
        flexGrow: 1,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF8EA',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        elevation: 4,
    },
    playerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    placeholderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
    },
    rank: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 30,
        textAlign: 'center',
    },
    playerName: {
        flex: 1,
        fontSize: 18,
    },
    playerStat: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff9800',
        marginRight: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#BFA68B',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        marginHorizontal: 5,
        marginBottom: -10,
        overflow: 'hidden', // Pour le bord d'arrondi invers
    },
    activeTab: {
        backgroundColor: '#E8CBAF',
        borderColor: '#d1d1d1',
        borderBottomWidth: 0,
        marginBottom: -10,
    },
    playersContainer: {
        backgroundColor: '#E8CBAF',
        borderTopWidth: 0,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    tabText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    activeTabText: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
    },

});


export default ClassementScreen;
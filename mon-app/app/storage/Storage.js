import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    PLAYERS: 'players',
    GAMES: 'games',
    RULES: 'rules',
};

export async function saveData(key, data) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erreur enregistrement données :', error);
    }
}

export async function loadData(key) {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Erreur chargement données :', error);
        return [];
    }
}

export async function getPlayers() {
    return await loadData(KEYS.PLAYERS);
}

export async function savePlayers(players) {
    await saveData(KEYS.PLAYERS, players);
}

export async function getGames() {
    return await loadData(KEYS.GAMES);
}

export async function saveGames(games) {
    await saveData(KEYS.GAMES, games);
}

export async function getRules() {
    return await loadData(KEYS.RULES);
}

export async function saveRules(rules) {
    await saveData(KEYS.RULES, rules);
}

export async function deleteGame(gameId) {
    const games = await getGames();
    const filtered = games.filter(g => g.id !== gameId);
    await saveGames(filtered);
}

export async function clearStorage() {
    try {
        await AsyncStorage.clear();
        console.log("Tous les données ont été supprimées du stockage.");
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
    }
}
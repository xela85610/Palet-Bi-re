
export function createPlayer(name, photoUri = null) {
    return {
        id: Date.now().toString(),
        name,
        photoUri,
        victories: 0,
        gamesPlayed: 0,
        sipDrinks: 0,
        winStreak: 0,
        bestStreak: 0,
    };
}

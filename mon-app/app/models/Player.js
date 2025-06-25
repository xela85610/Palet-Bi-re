
export function createPlayer(name, photoUri = null) {
    return {
        id: Date.now().toString(), // ID unique
        name,
        photoUri,                 // URI image depuis Camera
        victories: 0,
        gamesPlayed: 0,
        beerDrinks: 0,
        winStreak: 0,
        bestStreak: 0,
    };
}

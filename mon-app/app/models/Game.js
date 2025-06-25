export function createGame(players) {
    return {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            score: 0,
        })),
        history: [],
        finalScore: null,
    };
}

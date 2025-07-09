export function createGame(players) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    return {
        id: Date.now().toString(),
        date: dateStr,
        players: players.map(p => ({
            id: p.id,
            name: p.name,
            score: 0,
            sips: 0,
        })),
        history: [],
        finalScore: null,
        winner: null,
    };
}

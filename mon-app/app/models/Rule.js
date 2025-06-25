export function createRule(scorePattern, title, sips) {
    return {
        id: Date.now().toString(),
        scorePattern,
        title,
        sips,
        active: true,
    };
}

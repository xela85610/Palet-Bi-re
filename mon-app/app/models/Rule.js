export function createRule(scorePattern, title, description) {
    return {
        id: Date.now().toString(),
        scorePattern, // ex: "8-5" ou "égalité"
        title,        // ex: "Égalité - tout le monde boit !"
        description,       // fonction ou description textuelle
        active: true,
    };
}

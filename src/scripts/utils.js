
/**
 * The name of the module
 */
export const modName = 'turnmarker';

/** Socket Info */
export const socketName = 'module.turnmarker';
export const socketAction = {
    deleteStartMarker: 1,
    deleteTurnMarker: 2,
    deleteOnDeckMarker: 3
};

/**
 * Returns a token object from the canvas based on the ID value
 * @param {String} tokenId - The ID of the token to look for
 */
export function findTokenById(tokenId) {
    return canvas.tokens.ownedTokens.find(t => t.id == tokenId);
}

/**
 * Returns a tile object from the canvas based on the ID value; mostly for debugging
 * @param {String} tileId - The ID of the token to look for
 */
export function findTileById(tileId) {
    return canvas.background.tiles.find(t => t.id == tileId);
}

/**
 * Returns the ID of the first user logged in as GM.
 * Use for actions that need to be done by a GM but by only 1 GM
 */
export function firstGM() {
    for (let user of game.users.contents) {
        if (user.data.role === CONST.USER_ROLES.GAMEMASTER && user.active) {
            return user.id;
        }
    }
    return undefined;
}

/**
 * Returns the index of the nextTurn
 * @param {Object} combat - combat object from foundry
 */
export function getNextTurn(combat) {
    return (combat.turn + 1) % combat.turns.length;
}

/**
 * Delete time
 * @param {Object} combat - combat object from foundry
 */
export async function deleteTile({ mode } = {}) {
    let tiles = null
    switch (mode) {
        case socketAction.deleteStartMarker:
            tiles = canvas.scene.getEmbeddedCollection('Tile')?.filter(t => t.data.flags?.startMarker === true)?.map(t => t.id)
            if (tiles?.length > 0) {
                await canvas.scene.deleteEmbeddedDocuments('Tile', tiles)
            }
            break
        case socketAction.deleteTurnMarker:
            tiles = canvas.scene.getEmbeddedCollection('Tile')?.filter(t => t.data.flags?.turnMarker === true)?.map(t => t.id)
            if (tiles?.length > 0) {
                await canvas.scene.deleteEmbeddedDocuments('Tile', tiles)
            }
            break
        case socketAction.deleteOnDeckMarker:
            tiles = canvas.scene.getEmbeddedCollection('Tile')?.filter(t => t.data.flags?.deckMarker === true)?.map(t => t.id)
            if (tiles?.length > 0) {
                await canvas.scene.deleteEmbeddedDocuments('Tile', tiles)
            }
            break
    }
}
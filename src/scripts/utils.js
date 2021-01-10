
/**
 * The name of the module
 */
export const modName = 'turnmarker';

/*** Flag Info */
export const FlagScope = 'turnmarker';
export const Flags = {
    startMarkerPlaced: 'startMarkerPlaced'
};

/** Socket Info */
export const socketName = 'module.turnmarker';
export const socketAction = {
    placeStartMarker: 0
};

/**
 * Returns a token object from the canvas based on the ID value
 * @param {String} tokenId - The ID of the token to look for
 */
export function findTokenById(tokenId) {
    return canvas.tokens.ownedTokens.find(t => t.id == tokenId);
}

/**
 * Returns the ID of the first user logged in as GM.
 * Use for actions that need to be done by a GM but by only 1 GM
 */
export function firstGM() {
    for (let user of game.users.entities) {
        if (user.data.role >= 4 && user.active) {
            return user.data._id;
        }
    }
    return undefined;
}
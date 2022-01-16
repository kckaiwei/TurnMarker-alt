import {Settings} from './settings.js';
import {deleteTile, findTokenById, socketAction, socketName} from './utils.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class Marker {

    /**
     * Deletes any tiles flagged as a 'Turn Marker' from the canvas
     */
    static async deleteTurnMarker() {
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteTurnMarker
            });
        } else {
            await deleteTile({ mode: socketAction.deleteTurnMarker });
        }
    }

    /**
     * Deletes any tiles flagged as a 'Deck Marker' from the canvas
     */
    static async deleteOnDeckMarker() {
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteOnDeckMarker
            });
        } else {
            await deleteTile({ mode: socketAction.deleteOnDeckMarker });
        }
    }

    /**
     * Places a new turn marker under the token specified, and if required, starts the animation
     * @param {String} tokenId - The ID of the token where the marker should be placed
     */
    static async placeTurnMarker(tokenId) {
        if (game.user.isGM && Settings.getIsEnabled("turnmarker")) {
            const token = findTokenById(tokenId);
            if (typeof token !== 'undefined') {
                let dims = this.getImageDimensions(token, false, "turnmarker");
                let center = this.getImageLocation(token, false, "turnmarker");
                const tile = canvas.scene.getEmbeddedCollection('Tile')?.find(t => t.data.flags?.turnMarker === true);
                const updateData = {
                    img: Settings.getImagePath(),
                    width: dims.w,
                    height: dims.h,
                    x: center.x,
                    y: center.y,
                    z: 900,
                    rotation: 0,
                    hidden: token.data.hidden,
                    locked: false
                };
                if (typeof tile === 'undefined') {
                    await canvas.scene.createEmbeddedDocuments('Tile', [{
                        ...updateData,
                        flags: { turnMarker: true }
                    }]);
                } else {
                    await canvas.scene.updateEmbeddedDocuments('Tile', [{
                        ...updateData,
                        _id: tile.id
                    }]);
                }
                return;
            }
        }
        await this.deleteTurnMarker();
    }

    static async placeOnDeckMarker(tokenId) {
        if (game.user.isGM && Settings.getIsEnabled("deckmarker")) {
            const token = findTokenById(tokenId);
            if (typeof token !== 'undefined') {
                let dims = this.getImageDimensions(token, false, "deckmarker");
                let center = this.getImageLocation(token, false, "deckmarker");
                let tile = canvas.scene.getEmbeddedCollection('Tile')?.find(t => t.data.flags?.deckMarker === true);
                const updateData = {
                    img: Settings.getOnDeckImagePath(),
                    width: dims.w,
                    height: dims.h,
                    x: center.x,
                    y: center.y,
                    z: 900,
                    rotation: 0,
                    hidden: token.data.hidden,
                    locked: false
                };
                if (typeof tile === 'undefined') {
                    await canvas.scene.createEmbeddedDocuments('Tile', [{
                        ...updateData,
                        flags: { deckMarker: true }
                    }]);
                } else {
                    await canvas.scene.updateEmbeddedDocuments('Tile', [{
                        ...updateData,
                        _id: tile.id
                    }]);
                }
                return;
            }
        }
        await this.deleteOnDeckMarker();
    }

    /**
     * Deletes any tiles flagged as a 'Start Marker' from the canvas
     */
    static async deleteStartMarker() {
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteStartMarker
            });
        } else {
            await deleteTile({ mode: socketAction.deleteStartMarker });
        }
    }

    /**
     * If enabled in settings, place a "start" marker under the token where their turn started.
     * @param {String} tokenId - The ID of the token to place the start marker under
     */
    static async placeStartMarker(tokenId) {
        if (game.user.isGM && Settings.getIsEnabled("startmarker")) {
            let token = findTokenById(tokenId);
            if (typeof token !== 'undefined') {
                let dims = this.getImageDimensions(token);
                let center = this.getImageLocation(token);
                let tile = canvas.scene.getEmbeddedCollection('Tile')?.find(t => t.data.flags?.startMarker === true);
                const updateData = {
                    img: Settings.getStartMarker(),
                    width: dims.w,
                    height: dims.h,
                    x: center.x,
                    y: center.y,
                    z: 900,
                    rotation: 0,
                    hidden: token.data.hidden,
                    locked: false
                };
                if (typeof tile === 'undefined') {
                    await canvas.scene.createEmbeddedDocuments('Tile', [{
                        ...updateData,
                        flags: { startMarker: true }
                    }]);
                } else {
                    await canvas.scene.updateEmbeddedDocuments('Tile', [{
                        ...updateData,
                        _id: tile.id
                    }]);
                }
                return;
            }
        }
        await this.deleteStartMarker();
    }

    /**
     * Moves the turn marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     * @param {String} markerId - The ID of the tile currently serving as the turn marker
     * @param {String} marker_type - The marker type
     */
    static async moveMarkerToToken(tokenId, markerId, marker_type="turnmarker") {
        let token = findTokenById(tokenId);
        if (typeof token !== 'undefined') {
            let dims = this.getImageDimensions(token, false, marker_type);
            let center = this.getImageLocation(token, false, marker_type);

            await canvas.scene.updateEmbeddedDocuments('Tile', [{
                _id: markerId,
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                hidden: token.data.hidden
            }]);
        }
    }

    /**
     * Removes any existing turn marker and start marker tiles from the canvas
     */
    static async clearAllMarkers() {
        await this.deleteTurnMarker();
        await this.deleteStartMarker();
        await this.deleteOnDeckMarker();
    }

    /**
     * Updates the tile image when the image path has changed
     */
    static async updateImagePath() {
        if (game.user.isGM) {
            let tile = canvas.scene.tiles.find(t => t.data.flags?.turnMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', [{
                    _id: tile.id,
                    img: Settings.getImagePath()
                }]);
            }
        }
    }

    /**
     * Updates the tile image when the image path has changed
     */
    static async updateOnDeckImagePath() {
        if (game.user.isGM) {
            let tile = canvas.scene.tiles.find(t => t.data.flags?.deckMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', [{
                    _id: tile.id,
                    img: Settings.getOnDeckImagePath()
                }]);
            }
        }
    }

    /**
     * Gets the proper dimensions of the marker tile taking into account the current grid layout
     * @param {object} token - The token that the tile should be placed under
     * @param {Boolean} ignoreRatio - Ignore ratio setting
     * @param {String} marker_type - The marker type
     */
    static getImageDimensions(token, ignoreRatio = false, marker_type = "turnmarker") {
        let ratio = ignoreRatio ? 1 : Settings.getRatio(marker_type);
        let newWidth = 0;
        let newHeight = 0;

        switch (canvas.grid.type) {
            case 2:
            case 3: // Hex Rows
                newWidth = newHeight = token.h * ratio;
                break;
            case 4:
            case 5: // Hex Columns
                newWidth = newHeight = token.w * ratio;
                break;
            default: // Gridless and Square
                newWidth = this.getSmallerDimension(token.w, token.h) * ratio;
                newHeight = this.getSmallerDimension(token.w, token.h) * ratio;
                break;
        }

        return {w: newWidth, h: newHeight};
    }

    /**
     * Returns the smaller dimension, so we can prevent lopsided markers when we have larger tokens on square/gridless
     * @param width
     * @param height
     * @returns {*}
     */
    static getSmallerDimension(width, height) {
        return width < height ? width : height;
    }

    /**
     * Gets the proper location of the marker tile taking into account the current grid layout
     * @param {object} token - The token that the tile should be placed under
     */
    static getImageLocation(token, ignoreRatio = false, marker_type = "turnmarker") {
        let ratio = ignoreRatio ? 1 : Settings.getRatio(marker_type);
        let newX = 0;
        let newY = 0;

        switch (canvas.grid.type) {
            case 2:
            case 3: // Hex Rows
                newX = token.center.x - ((token.h * ratio) / 2);
                newY = token.center.y - ((token.h * ratio) / 2);
                break;
            case 4:
            case 5: // Hex Columns
                newX = token.center.x - ((token.w * ratio) / 2);
                newY = token.center.y - ((token.w * ratio) / 2);
                break;
            default: // Gridless and Square
                newX = token.center.x - ((this.getSmallerDimension(token.w, token.h) * ratio) / 2);
                newY = token.center.y - ((this.getSmallerDimension(token.w, token.h) * ratio) / 2);
        }

        return {x: newX, y: newY};
    }
}
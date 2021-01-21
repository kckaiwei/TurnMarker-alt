import {MarkerAnimation} from './markeranimation.js';
import {Settings} from './settings.js';
import {findTokenById, Flags, FlagScope, socketAction, socketName} from './utils.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class Marker {

    /**
     * Deletes any tiles flagged as a 'Turn Marker' from the canvas
     */
    static async deleteTurnMarker() {
        const to_delete = canvas.scene.getEmbeddedCollection('Tile')
            .filter(tile => tile.flags.turnMarker)
            .map(tile => tile._id);
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteTurnMarker,
                tileData: to_delete.data
            });
        } else {
            await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
        }
    }

    /**
     * Deletes any tiles flagged as a 'Deck Marker' from the canvas
     */
    static async deleteOnDeckMarker() {
        const to_delete = canvas.scene.getEmbeddedCollection('Tile')
            .filter(tile => tile.flags.deckMarker)
            .map(tile => tile._id);
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteOnDeckMarker,
                tileData: to_delete.data
            });
        } else {
            await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
        }
    }

    /**
     * Places a new turn marker under the token specified, and if required, starts the animation
     * @param {String} tokenId - The ID of the token where the marker should be placed
     * @param {Object} animator - The animator object
     * @param {String} markerId - The ID of the tile being used as the turn marker
     */
    static async placeTurnMarker(tokenId, markerId) {
        if (!markerId) {
            await this.deleteTurnMarker();

            if (Settings.getIsEnabled("turnmarker")) {
                let token = findTokenById(tokenId);
                let dims = this.getImageDimensions(token, false, "turnmarker");
                let center = this.getImageLocation(token, false, "turnmarker");

                let newTile = new Tile({
                    img: Settings.getImagePath(),
                    width: dims.w,
                    height: dims.h,
                    x: center.x,
                    y: center.y,
                    z: 900,
                    rotation: 0,
                    hidden: token.data.hidden,
                    locked: false,
                    flags: {turnMarker: true}
                });

                let tile = await canvas.scene.createEmbeddedEntity('Tile', newTile.data);

                return tile._id;
            } else {
                return null;
            }
        } else {
            await this.moveMarkerToToken(tokenId, markerId, "turnmarker");
            return markerId;
        }
    }

    static async placeOnDeckMarker(tokenId) {
        await this.deleteOnDeckMarker();

        if (Settings.getIsEnabled("deckmarker")) {
            let token = findTokenById(tokenId);
            let dims = this.getImageDimensions(token, false, "deckmarker");
            let center = this.getImageLocation(token, false, "deckmarker");
            let newTile = new Tile({
                img: Settings.getOnDeckImagePath(),
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                z: 900,
                rotation: 0,
                hidden: token.data.hidden,
                locked: false,
                flags: {deckMarker: true}
            });

            if (game.user.isGM) {
                await canvas.scene.createEmbeddedEntity('Tile', newTile.data);
            }
        }
    }


    /**
     * Deletes any tiles flagged as a 'Start Marker' from the canvas
     */
    static async deleteStartMarker() {
        const to_delete = canvas.scene.getEmbeddedCollection('Tile')
            .filter(tile => tile.flags.startMarker)
            .map(tile => tile._id);
        if (!game.user.isGM) {
            game.socket.emit(socketName, {
                mode: socketAction.deleteStartMarker,
                tileData: to_delete.data
            });
        } else {
            await canvas.scene.unsetFlag(FlagScope, Flags.startMarkerPlaced);
            await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
        }
    }

    /**
     * If enabled in settings, place a "start" marker under the token where their turn started.
     * @param {String} tokenId - The ID of the token to place the start marker under
     */
    static async placeStartMarker(tokenId) {
        await this.deleteStartMarker();

        if (Settings.getIsEnabled("startmarker")) {
            let token = findTokenById(tokenId);
            let dims = this.getImageDimensions(token);
            let center = this.getImageLocation(token);
            let newTile = new Tile({
                img: Settings.getStartMarker(),
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                z: 900,
                rotation: 0,
                hidden: token.data.hidden,
                locked: false,
                flags: {startMarker: true}
            });

            if (game.user.isGM) {
                await canvas.scene.createEmbeddedEntity('Tile', newTile.data);
                await canvas.scene.setFlag(FlagScope, Flags.startMarkerPlaced, true);
            }
        }
    }

    /**
     * Moves the turn marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     * @param {String} markerId - The ID of the tile currently serving as the turn marker
     */
    static async moveMarkerToToken(tokenId, markerId, marker_type="turnmarker") {
        let token = findTokenById(tokenId);
        let dims = this.getImageDimensions(token, false, marker_type);
        let center = this.getImageLocation(token, false, marker_type);

        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: markerId,
            width: dims.w,
            height: dims.h,
            x: center.x,
            y: center.y,
            hidden: token.data.hidden
        });
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
            let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', {
                    _id: tile.id,
                    img: Settings.getImagePath()
                });
            }
        }
    }

    /**
     * Updates the tile image when the image path has changed
     */
    static async updateOnDeckImagePath() {
        if (game.user.isGM) {
            let tile = canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', {
                    _id: tile.id,
                    img: Settings.getOnDeckImagePath()
                });
            }
        }
    }

    /**
     * Completely resets the turn marker - deletes all tiles and stops any animation
     */
    static async reset() {
        MarkerAnimation.stopAllAnimation();
        await this.clearAllMarkers();
    }

    /**
     * Gets the proper dimensions of the marker tile taking into account the current grid layout
     * @param {object} token - The token that the tile should be placed under
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
                newWidth = token.w * ratio;
                newHeight = token.h * ratio;
                break;
        }

        return {w: newWidth, h: newHeight};
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
                newX = token.center.x - ((token.w * ratio) / 2);
                newY = token.center.y - ((token.h * ratio) / 2);
        }

        return {x: newX, y: newY};
    }
}
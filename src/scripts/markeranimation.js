import { Settings } from './settings.js';

export class MarkerAnimation {
    /**
     * Starts the animation loop for the specified tile
     * @param {object} animator - The animator object
     * @param {String} tileId - The ID of the tile currently serving as the turn marker 
     */
    static startAnimation(animator, tileId) {
        let tile = canvas.scene.getEmbeddedEntity('Tile', tileId);
        animator = this.animateRotation.bind(tile);
        canvas.app.ticker.add(animator);
        return animator;
    }

    /**
     * Stops the animation loop for the specified tile
     * @param {object} animator - The animator object
     */
    static stopAnimation(animator) {
        canvas.app.ticker.remove(animator);
    }

    /**
     * Called on every tick of the animation loop to rotate the image based on the current frame
     * @param {number} dt - The delta time
     */
    static animateRotation(dt) {
        let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        if (tile && tile.data.img) {
            let delta = Settings.getInterval() / 10000;
            try {
                tile.tile.img.rotation += (delta * dt);
            } catch (err) {
                // skip lost frames if the tile is being updated by the server
            }
        }
    }
}
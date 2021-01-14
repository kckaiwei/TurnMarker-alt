import { Settings } from './settings.js';

export class MarkerAnimation {
    /**
     * Starts the animation loop
     */
    static startAnimation() {
        if (!this.animator) {
            this.animator = this.animateRotation.bind(this);
            canvas.app.ticker.add(this.animator);
        }
        return this.animator;
    }

    /**
     * Stops the animation loop
     */
    static stopAnimation() {
        if (this.animator) {
            canvas.app.ticker.remove(this.animator);
            delete this.animator;
        }
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
import {Settings} from './settings.js';

export class MarkerAnimation {
    /**
     * Starts the animation loop
     */

    static startAnimation(marker_type = "turnmarker") {
        if (!this.animators) {
            this.animators = {};
        }
        if (marker_type in this.animators) {
            return this.animators[marker_type];
        }
        this.animators[marker_type] = this.animateRotation.bind(this, marker_type);
        canvas.app.ticker.add(this.animators[marker_type]);
        return this.animators;
    }

    /**
     * Stops the animation loop
     */
    static stopAnimation(marker_type = "turnmarker") {
        if (this.animators) {
            canvas.app.ticker.remove(this.animators[marker_type]);
            delete this.animators[marker_type];
        }
    }

    static stopAllAnimation() {
        for (const [key, value] of Object.entries(this.animators)) {
            canvas.app.ticker.remove(this.animators[key]);
        }
        this.animators = {};
    }

    /**
     * Called on every tick of the animation loop to rotate the image based on the current frame
     * @param {string} marker_type - type of marker to animate
     * @param {number} dt - The delta time
     */
    static animateRotation(marker_type, dt) {
        let tile;
        switch (marker_type) {
            case "turnmarker":
                tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
                break;
            case "deckmarker":
                tile = canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true);
                break;
            default:
                tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        }

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
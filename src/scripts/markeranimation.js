import { firstGM } from './utils.js';
import { Settings } from './settings.js';

const rotationDelta = 0.50; // How much to rotate by when the timer fires
const totalRotationTime = 60; // How long it should take for a full rotation by default.

/**
 * Methods here can be called from all users, they will only be run once. This is ensured through checks against firstGM.
 */
export class MarkerAnimation {
    /**
     * Starts the animation loop for a certain type of marker
     * @param {string} marker_type - type of marker to start animating
     */
    static startAnimation(marker_type) {
        if (firstGM() === game.userId) {

            if (!this.animators) {
                this.animators = {};
            }
            if (marker_type in this.animators) {
                return this.animators[marker_type];
            }
            this.animators[marker_type] = new Animator(marker_type);
            return this.animators;
        }
    }

    /**
     * Stops the animation loop for a certain type of marker
     * @param {string} marker_type - type of marker to stop animating
     */
    static stopAnimation(marker_type) {
        if (firstGM() === game.userId) {
            MarkerAnimation.startAnimation(marker_type); // Make sure something's there before we delete it.
            if (this.animators) {
                this.animators[marker_type].stopAnimation();
                delete this.animators[marker_type];
            }
        }
    }

    /**
     * Tells all currently running animators to stop their rotations. Then drops the table of animators.
     */
    static stopAllAnimation() {
        if (firstGM() === game.userId) {
            if (this.animators) {
                for (const [, value] of Object.entries(this.animators)) {
                    value.stopAnimation();
                }
                this.animators = {};
            }
        }
    }
}

class Animator {
    /**
     * Manages animating a specific set of markers. Construction begins animation.
     * @param {string} marker_type - type of markers managed
     */
    constructor(marker_type) {
        /**
         * Speed forumla is such that a speed of 1 will rotate in the total rotation time.
         * Lower speed values should slow the animation, and higher values should speed it up.
         */
        const base_update_freq = (360 / rotationDelta) / totalRotationTime; // In Hertz
        const interval = (1 / (base_update_freq * Settings.getSpeed())) * 1000; // Hertz to seconds, account for speedup, and convert to milliseconds

        this.marker_type = marker_type;
        this.timeout = setInterval(this.rotateMarker.bind(this), interval);
    }

    /**
     * Tell the interval timer to stop calling rotateMarker.
     */
    stopAnimation() {
        clearInterval(this.timeout);
    }

    /**
     * Rotate the marker. Called periodically by setInterval when the class is constructed.
     */
    async rotateMarker() {
        let tile;
        switch (this.marker_type) {
            case "deckmarker":
                tile = canvas.scene.tiles.find(t => t.flags?.deckMarker == true);
                break;
            case "turnmarker":
            default:
                tile = canvas.scene.tiles.find(t => t.flags?.turnMarker == true);
                break;
        }
        try {
            await tile.object.rotate(tile.rotation + rotationDelta, 0.001);
        } catch (err) {
            // If the tile has disappeared between finding it and trying to rotate it, it's probably been deleted.
            // That's not a problem, so just fail silently.
        }
    }
}

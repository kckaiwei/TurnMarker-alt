import {Settings} from './settings.js';
import {socketName} from './utils.js';

export class MarkerAnimation {
    /**
     * Starts the animation loop
     */
    static startAnimationGM(marker_type = "turnmarker") {
        MarkerAnimation.startAnimation(marker_type)
        game.socket.emit(socketName, {
            startAnimation: marker_type
        });
    }

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
    static stopAnimationGM(marker_type = "turnmarker") {
        MarkerAnimation.startAnimation(marker_type)
        game.socket.emit(socketName, {
            stopAnimation: marker_type
        });
    }

    static stopAnimation(marker_type = "turnmarker") {
        if (this.animators) {
            canvas.app.ticker.remove(this.animators[marker_type]);
            delete this.animators[marker_type];
        }
    }

    static stopAllAnimationGM() {
        MarkerAnimation.stopAllAnimation()
        game.socket.emit(socketName, {
            stopAllAnimation: 'all'
        });
    }

    static stopAllAnimation() {
        if (this.animators) {
            for (const [, value] of Object.entries(this.animators)) {
                canvas.app.ticker.remove(value);
            }
            this.animators = {};
        }
    }

    /**
     * Called on every tick of the animation loop to rotate the image based on the current frame
     * @param {string} marker_type - type of marker to animate
     * @param {number} dt - The delta time
     */
    static animateRotation(marker_type, dt) {
        let tile;
        switch (marker_type) {
            case "deckmarker":
                tile = canvas.background.tiles.find(t => t.data.flags?.deckMarker == true);
                break;
            case "turnmarker":
            default:
                tile = canvas.background.tiles.find(t => t.data.flags?.turnMarker == true);
                break;
        }
        if (tile?.data.img) {
            let delta = Settings.getInterval() / 10000;
            try {
                tile.tile.rotation += (delta * dt);
            } catch (err) {
                // skip lost frames if the tile is being updated by the server
            }
        }
    }
}
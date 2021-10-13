import { Settings } from './settings.js';

export class MarkerAnimation {
  /**
   * Starts the animation loop
   */
  static startAnimation (markerType = 'turnmarker') {
    if (!this.animators) {
      this.animators = {};
    }
    if (markerType in this.animators) {
      return this.animators[markerType];
    }
    this.animators[markerType] = this.animateRotation.bind(this, markerType);
    canvas.app.ticker.add(this.animators[markerType]);
    return this.animators;
  }

  /**
   * Stops the animation loop
   */
  static stopAnimation (markerType = 'turnmarker') {
    if (this.animators) {
      canvas.app.ticker.remove(this.animators[markerType]);
      delete this.animators[markerType];
    }
  }

  static stopAllAnimation () {
    if (this.animators) {
      for (const [, value] of Object.entries(this.animators)) {
        canvas.app.ticker.remove(value);
      }
      this.animators = {};
    }
  }

  /**
   * Called on every tick of the animation loop to rotate the image based on the current frame
   * @param {string} markerType - type of marker to animate
   * @param {number} dt - The delta time
   */
  static animateRotation (markerType, dt) {
    let tile;
    switch (markerType) {
      case 'deckmarker':
        tile = canvas.background.tiles.find(t => t.data.flags?.deckMarker === true);
        break;
      case 'turnmarker':
      default:
        tile = canvas.background.tiles.find(t => t.data.flags?.turnMarker === true);
        break;
    }
    if (tile?.data.img) {
      const delta = Settings.getInterval() / 10000;
      try {
        tile.tile.rotation += (delta * dt);
      } catch (err) {
        // skip lost frames if the tile is being updated by the server
      }
    }
  }
}

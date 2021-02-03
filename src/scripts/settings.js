import {Marker} from './marker.js';
import {MarkerAnimation} from './markeranimation.js';
import {SettingsForm} from './settingsForm.js';
import {modName, getNextTurn} from './utils.js';

const version = 'tm-version';
const interval = 'interval';
const announce = 'announce-turn';
const announceActors = 'announce-Actors';
const announceAsActor = 'announce-asActor';
const announceImage = 'announce-image';
const announceTokenName = 'announce-token';

// Turn marker constants
const image = 'image';
const customimage = 'customimage';
const ratio = 'ratio';
const turnMarkerEnabled = 'turnmarker-enabled';
const animation = 'animation';

// Ondeck marker constants
const onDeckMarkerEnabled = 'ondeckmarker-enabled';
const deckImage = 'deckimage';
const customDeckImage = 'customdeckimage';
const deckRatio = 'deckratio';
const deckAnimation = 'deckanimation';
const deckPlayersOnly = 'deckplayersonly';

const startMarkerEnabled = 'startMarker-enabled';
const startMarkerImage = 'startMarker-custom';

//pantocanvas
const panToTokenEnabled = 'panToToken-enabled';

//images
export const imageTitles = [
    'Runes of Incendium by Rin',
    'Runes of the Cultist by Rin',
    'Runes of Regeneration by Rin',
    'Runes of the Cosmos by Rin',
    'Runes of Earthly Dust by Rin',
    'Runes of Reality by Rin',
    'Runes of the Believer by Rin',
    'Runes of the Mad Mage by Rin',
    'Runes of the Blue Sky by Rin',
    'Runes of the Universe by Rin',
    'Runes of Prosperity by Rin'
];

export const deckImageTitles = [
    'Runes of Prosperity by Rin',
    'Runes of Incendium by Rin',
    'Runes of the Cultist by Rin',
    'Runes of Regeneration by Rin',
    'Runes of the Cosmos by Rin',
    'Runes of Earthly Dust by Rin',
    'Runes of Reality by Rin',
    'Runes of the Believer by Rin',
    'Runes of the Mad Mage by Rin',
    'Runes of the Blue Sky by Rin',
    'Runes of the Universe by Rin'
];

export const announcedActorOptions = [
    'Announce for all',
    'Announce for players',
    'Announce for GM-controlled',
    'Announce all but hide GM-controlled names'
];

/**
 * Provides functionality for reading and writing module settings
 */
export class Settings {

    static getVersion() {
        return game.settings.get(modName, version);
    }

    static setVersion(val) {
        game.settings.set(modName, version, val);
    }

    /**
     * Gets the image ratio given a marker_type
     */
    static getRatio(marker_type) {
        switch (marker_type) {
            case "turnmarker":
                return game.settings.get(modName, ratio);
            case "deckmarker":
                return game.settings.get(modName, deckRatio);
        }
    }

    /**
     * Sets the turn marker image ratio
     * @param {Number} val - The image ratio
     */
    static setRatio(val) {
        game.settings.set(modName, ratio, val);
    }

    /**
     * Sets the ondeck image ratio
     * @param {Number} val - The image ratio
     */
    static setDeckRatio(val) {
        game.settings.set(modName, deckRatio, val);
    }

    /**
     * Returns true if the marker should be animated
     */
    static getShouldAnimate(marker_type) {
        switch (marker_type) {
            case "turnmarker":
                return game.settings.get(modName, animation);
            case "deckmarker":
                return game.settings.get(modName, deckAnimation);
        }

    }

    /**
     * Gets the animation interval in ms.
     */
    static getInterval() {
        return game.settings.get(modName, interval);
    }

    /**
     * Returns true if turn changes should be announced in chat
     */
    static shouldAnnounceTurns() {
        return game.settings.get(modName, announce);
    }

    /**
     * Sets whether or not to announce turn changes
     * @param {Boolean} val - Whether or not to announce turn changes
     */
    static setShouldAnnounceTurns(val) {
        game.settings.set(modName, announce, val);
    }


    /**
     * Gets index of setting
     * @returns {Number} - Index number of announced
     */
    static getAnnounceActors() {
        return game.settings.get(modName, announceActors);
    }

    /**
     * Sets who sees announced turn changes
     * @param announceActors - which owners get units announcedActorOptions, which is selected.
     */
    static setAnnounceActors(val) {
        return game.settings.set(modName, announceActors, val);
    }

    static getAnnounceTokenName() {
        return game.settings.get(modName, announceTokenName);
    }

    static setAnnounceTokenName(val) {
        return game.settings.set(modName, announceTokenName, val);
    }

    static getIncludeAnnounceImage() {
        return game.settings.get(modName, announceImage);
    }

    static setIncludeAnnounceImage(val) {
        game.settings.set(modName, announceImage, val);
    }

    /**
     * Gets the index of the currently selected marker image
     * @param {string} marker_type - Type of marker to get index for
     */
    static getImageIndex(marker_type) {
        switch (marker_type) {
            case "turnmarker":
                return game.settings.get(modName, image);
            case "deckmarker":
                return game.settings.get(modName, deckImage);
        }
    }

    static getStartMarker() {
        if (game.settings.get(modName, startMarkerImage).trim() == '') {
            return 'modules/turnmarker/assets/start.png';
        } else {
            return game.settings.get(modName, startMarkerImage);
        }
    }

    /**
     * Gets the IsEnabled property of passed marker_type
     * @param marker_type - Type of marker to check isEnabled
     */
    static getIsEnabled(marker_type) {
        switch (marker_type) {
            case "turnmarker":
                return game.settings.get(modName, turnMarkerEnabled);
            case "deckmarker":
                return game.settings.get(modName, onDeckMarkerEnabled);
            case "startmarker":
                return game.settings.get(modName, startMarkerEnabled);
            case "panToToken":
                return game.settings.get(modName, panToTokenEnabled);
                break;
        }
    }

    /**
     * Sets the IsEnabled property of passed marker_type
     * @param marker_type - Type of marker to check isEnabled
     * @param val - boolean
     */
    static setIsEnabled(marker_type, val) {
        switch (marker_type) {
            case "turnmarker":
                game.settings.set(modName, turnMarkerEnabled, val);
                break;
            case "deckmarker":
                game.settings.set(modName, onDeckMarkerEnabled, val);
                break;
            case "startmarker":
                game.settings.set(modName, startMarkerEnabled, val);
                break;
            case "panToToken":
                game.settings.set(modName, panToTokenEnabled, val);
                break;
        }
    }

    static getStartMarkerPath() {
        return game.settings.get(modName, startMarkerImage);
    }

    static setStartMarkerPath(val) {
        game.settings.set(modName, startMarkerImage, val);
    }

    /**
     * Gets a path to the currently selected image to be used as the marker
     */
    static getImagePath() {
        if (game.settings.get(modName, customimage).trim() == '') {
            return this.getImageByIndex(game.settings.get(modName, image));
        } else {
            return game.settings.get(modName, customimage);
        }
    }

    /**
     * Gets a path to the currently selected image to be used as the onDeck marker
     */
    static getOnDeckImagePath() {
        if (game.settings.get(modName, customDeckImage).trim() == '') {
            return this.getDeckImageByIndex(game.settings.get(modName, deckImage));
        } else {
            return game.settings.get(modName, customDeckImage);
        }
    }

    static getImageByIndex(index) {
        switch (index) {
            case 0:
                return 'modules/turnmarker/assets/incendium.png';
            case 1:
                return 'modules/turnmarker/assets/cultist.png';
            case 2:
                return 'modules/turnmarker/assets/regeneration.png';
            case 3:
                return 'modules/turnmarker/assets/cosmos.png';
            case 4:
                return 'modules/turnmarker/assets/earthlydust.png';
            case 5:
                return 'modules/turnmarker/assets/reality.png';
            case 6:
                return 'modules/turnmarker/assets/believer.png';
            case 7:
                return 'modules/turnmarker/assets/madmage.png';
            case 8:
                return 'modules/turnmarker/assets/bluesky.png';
            case 9:
                return 'modules/turnmarker/assets/universe.png';
            case 10:
                return 'modules/turnmarker/assets/prosperity.png';
        }
    }

    /**
     * Gets on deck marker image path
     */
    static getDeckImageByIndex(index) {
        switch (index) {
            case 0:
                return 'modules/turnmarker/assets/prosperity.png';
            case 1:
                return 'modules/turnmarker/assets/incendium.png';
            case 2:
                return 'modules/turnmarker/assets/cultist.png';
            case 3:
                return 'modules/turnmarker/assets/regeneration.png';
            case 4:
                return 'modules/turnmarker/assets/cosmos.png';
            case 5:
                return 'modules/turnmarker/assets/earthlydust.png';
            case 6:
                return 'modules/turnmarker/assets/reality.png';
            case 7:
                return 'modules/turnmarker/assets/believer.png';
            case 8:
                return 'modules/turnmarker/assets/madmage.png';
            case 9:
                return 'modules/turnmarker/assets/bluesky.png';
            case 10:
                return 'modules/turnmarker/assets/universe.png';
        }
    }

    static setImage(image_type, val) {
        switch (image_type) {
            case "turnmarker":
                game.settings.set(modName, image, val);
                break;
            case "deckmarker":
                game.settings.set(modName, deckImage, val);
                break;
        }

    }

    static getCustomImagePath() {
        return game.settings.get(modName, customimage);
    }

    static setCustomImagePath(val) {
        game.settings.set(modName, customimage, val);
    }

    /**
     * Gets on deck marker image path
     */
    static getCustomDeckImagePath() {
        return game.settings.get(modName, customDeckImage);
    }

    /**
     * Sets ondeck marker image path
     * @param val - path to desired image.
     */
    static setCustomDeckImagePath(val) {
        game.settings.set(modName, customDeckImage, val);
    }

    /**
     * Gets if deck markers only used for players
     */
    static getDeckPlayersOnly() {
        return game.settings.get(modName, deckPlayersOnly);
    }

    /**
     * Sets if deck markers only used for players
     * @param val - boolean
     */
    static setDeckPlayersOnly(val) {
        game.settings.set(modName, deckPlayersOnly, val);
    }


    /**
     * Registers all game settings
     */
    static registerSettings() {

        game.settings.registerMenu(modName, 'tm.settingsMenu', {
            name: 'tm.settings.button.name',
            label: 'tm.settings.button.label',
            icon: 'fas fa-sync-alt',
            type: SettingsForm,
            restricted: true,
        });

        game.settings.register(modName, version, {
            name: `${modName} version`,
            default: '0.0.0',
            type: String,
            scope: 'world',
        });

        game.settings.register(modName, ratio, {
            name: 'tm.settings.ratio.name',
            hint: 'tm.settings.ratio.hint',
            scope: 'world',
            config: false,
            type: Number,
            default: 1.5,
            restricted: true
        });

        game.settings.register(modName, animation, {
            name: 'tm.settings.animate.name',
            hint: 'tm.settings.animate.hint',
            scope: 'user',
            config: true,
            type: Boolean,
            default: true,
            onChange: shouldAnimate => {
                if (!game.paused && shouldAnimate && canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true)) {
                    MarkerAnimation.startAnimation("turnmarker");
                } else {
                    MarkerAnimation.stopAnimation("turnmarker");
                }
            }
        });

        game.settings.register(modName, deckAnimation, {
            name: 'tm.settings.deckAnimate.name',
            hint: 'tm.settings.deckAnimate.hint',
            scope: 'user',
            config: true,
            type: Boolean,
            default: true,
            onChange: shouldAnimate => {
                if (!game.paused && shouldAnimate && canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true)) {
                    MarkerAnimation.startAnimation("deckmarker");
                } else {
                    MarkerAnimation.stopAnimation("deckmarker");
                }
            }
        });

        game.settings.register(modName, interval, {
            name: 'tm.settings.interval.name',
            hint: 'tm.settings.interval.hint',
            scope: 'user',
            config: true,
            type: Number,
            default: 100
        });

        game.settings.register(modName, image, {
            name: 'tm.settings.image.name',
            scope: 'world',
            config: false,
            type: Number,
            default: 0,
            choices: imageTitles,
            restricted: true,
            onChange: value => Marker.updateImagePath(value)
        });

        // OnDeck Marker Settings
        game.settings.register(modName, deckRatio, {
            name: 'tm.settings.deckRatio.name',
            hint: 'tm.settings.deckRatio.hint',
            scope: 'world',
            config: false,
            type: Number,
            default: 1.5,
            restricted: true
        });

        game.settings.register(modName, deckImage, {
            name: 'tm.settings.deckImage.name',
            scope: 'world',
            config: false,
            type: Number,
            default: 0,
            choices: deckImageTitles,
            restricted: true,
            onChange: value => Marker.updateOnDeckImagePath(value)
        });

        game.settings.register(modName, customDeckImage, {
            name: 'tm.settings.customDeckImage.name',
            hint: 'tm.settings.customDeckImage.hint',
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true,
            onChange: value => Marker.updateOnDeckImagePath(value)
        });

        game.settings.register(modName, onDeckMarkerEnabled, {
            name: 'tm.settings.onDeckMarkerEnabled.name',
            hint: 'tm.settings.onDeckMarkerEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: false,
            restricted: true,
            onChange: enabled => {
                if (!enabled) {
                    Marker.deleteOnDeckMarker();
                } else if (game.combat && game.combat.combatant && game.combat.started) {
                    let nextTurn = getNextTurn(game.combat);
                    Marker.placeOnDeckMarker(game.combat.turns[nextTurn].token._id);
                }
            }
        });

        game.settings.register(modName, deckPlayersOnly, {
            name: 'tm.settings.deckPlayersOnly.name',
            hint: 'tm.settings.deckPlayersOnly.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true,
            restricted: true,
        });

        // Announcements
        game.settings.register(modName, announceActors, {
            name: 'tm.settings.announcedActors.name',
            hint: 'tm.settings.announcedActors.hint',
            scope: 'world',
            config: false,
            type: Number,
            default: 0,
            restricted: true,
            choices: announcedActorOptions,
        });

        game.settings.register(modName, announceTokenName, {
            name: 'tm.settings.announceTokenName.name',
            hint: 'tm.settings.announceTokenName.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: false,
            restricted: true,
        });

        game.settings.register(modName, customimage, {
            name: 'tm.settings.customImage.name',
            hint: 'tm.settings.customImage.hint',
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true,
            onChange: value => Marker.updateImagePath(value)
        });

        game.settings.register(modName, announce, {
            name: 'tm.settings.announce.name',
            hint: 'tm.settings.announce.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, announceImage, {
            name: 'tm.settings.announceImage.name',
            hint: 'tm.settings.announceImage.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, announceAsActor, {
            name: 'tm.settings.announceAs.name',
            hint: 'tm.settings.announceAs.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, turnMarkerEnabled, {
            name: 'tm.settings.turnMarkerEnabled.name',
            hint: 'tm.settings.turnMarkerEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true,
            restricted: true,
            onChange: enabled => {
                if (!enabled) {
                    Marker.deleteTurnMarker();
                } else if (game.combat && game.combat.combatant && game.combat.started) {
                    Marker.placeTurnMarker(game.combat.combatant.token._id);
                }
            }
        });

        game.settings.register(modName, startMarkerEnabled, {
            name: 'tm.settings.startEnabled.name',
            hint: 'tm.settings.startEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: false,
            restricted: true,
            onChange: enabled => {
                if (!enabled) {
                    Marker.deleteStartMarker();
                } else if (game.combat && game.combat.combatant && game.combat.started) {
                    Marker.placeStartMarker(game.combat.combatant.token._id);
                }
            }
        });

        game.settings.register(modName, panToTokenEnabled, {
            name: 'tm.settings.panToTokenEnabled.name',
            hint: 'tm.settings.panToTokenEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: false,
            restricted: true
        });

        game.settings.register(modName, startMarkerImage, {
            name: 'tm.settings.startImage.name',
            hint: 'tm.settings.startImage.hint',
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true
        });
    }
}
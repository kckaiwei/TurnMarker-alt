import { Marker } from './marker.js';
import { SettingsForm } from './settingsForm.js';
import { modName } from './utils.js';

const version = 'tm-version';
const ratio = 'ratio';
const animation = 'animation';
const interval = 'interval';
const announce = 'announce-turn';
const announceActors = 'announce-Actors';
const announceAsActor = 'announce-asActor';
const announceImage = 'announce-image';
const announceTokenName = 'announce-token';
const image = 'image';
const customimage = 'customimage';
const turnMarkerEnabled = 'turnmarker-enabled';
const startMarkerEnabled = 'startMarker-enabled';
const startMarkerImage = 'startMarker-custom';
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
     * Gets the image ratio
     */
    static getRatio() {
        return game.settings.get(modName, ratio);
    }

    /**
     * Sets the image ratio
     * @param {Number} val - The image ratio
     */
    static setRatio(val) {
        game.settings.set(modName, ratio, val);
    }

    /**
     * Returns true if the marker should be animated
     */
    static getShouldAnimate() {
        return game.settings.get(modName, animation);
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
     */
    static getImageIndex() {
        return game.settings.get(modName, image);
    }

    static getStartMarker() {
        if (game.settings.get(modName, startMarkerImage).trim() == '') {
            return 'modules/turnmarker/assets/start.png';
        } else {
            return game.settings.get(modName, startMarkerImage);
        }
    }

    static getTurnMarkerEnabled() {
        return game.settings.get(modName, turnMarkerEnabled);
    }


    static setTurnMarkerEnabled(val) {
        game.settings.set(modName, turnMarkerEnabled, val);
    }

    static getStartMarkerEnabled() {
        return game.settings.get(modName, startMarkerEnabled);
    }

    static setStartMarkerEnabled(val) {
        game.settings.set(modName, startMarkerEnabled, val);
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

    static getImageByIndex(index) {
        switch (index) {
            case 0: return 'modules/turnmarker/assets/incendium.png';
            case 1: return 'modules/turnmarker/assets/cultist.png';
            case 2: return 'modules/turnmarker/assets/regeneration.png';
            case 3: return 'modules/turnmarker/assets/cosmos.png';
            case 4: return 'modules/turnmarker/assets/earthlydust.png';
            case 5: return 'modules/turnmarker/assets/reality.png';
            case 6: return 'modules/turnmarker/assets/believer.png';
            case 7: return 'modules/turnmarker/assets/madmage.png';
            case 8: return 'modules/turnmarker/assets/bluesky.png';
            case 9: return 'modules/turnmarker/assets/universe.png';
            case 10: return 'modules/turnmarker/assets/prosperity.png';
        }
    }

    static setImage(val) {
        game.settings.set(modName, image, val);
    }

    static getCustomImagePath() {
        return game.settings.get(modName, customimage);
    }

    static setCustomImagePath(val) {
        game.settings.set(modName, customimage, val);
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
            restricted: true
        });

        game.settings.register(modName, startMarkerEnabled, {
            name: 'tm.settings.startEnabled.name',
            hint: 'tm.settings.startEnabled.hint',
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
import {imageTitles, deckImageTitles, announcedActorOptions, Settings} from './settings.js';

const videos = ['mp4', 'webm', 'ogg'];

export class SettingsForm extends FormApplication {

    constructor(object, options = {}) {
        super(object, options);
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'turnmarker-settings-form',
            title: 'Turn Marker - Global Settings',
            template: './modules/turnmarker/templates/settings.html',
            classes: ['sheet', 'tm-settings'],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        return {
            turnMarkerEnabled: Settings.getIsEnabled("turnmarker"),
            ratio: Settings.getRatio("turnmarker"),
            image: this.getSelectList(imageTitles, Settings.getImageIndex("turnmarker")),
            customImage: Settings.getCustomImagePath(),
            previewPath: Settings.getImagePath(),
            // onDeck Marker Settings
            onDeckMarkerEnabled: Settings.getIsEnabled("deckmarker"),
            deckRatio: Settings.getRatio("deckmarker"),
            deckImage: this.getSelectList(deckImageTitles, Settings.getImageIndex("deckmarker")),
            customDeckImage: Settings.getCustomDeckImagePath(),
            onDeckPreviewPath: Settings.getOnDeckImagePath(),
            onDeckPlayersOnly: Settings.getDeckPlayersOnly(),
            // Announcement Settings
            announceActors: this.getSelectList(announcedActorOptions, Settings.getAnnounceActors()),
            announce: Settings.shouldAnnounceTurns(),
            announceImage: Settings.getIncludeAnnounceImage(),
            announceTokenName: Settings.getAnnounceTokenName(),
            announceTurnMarkerAlias: Settings.getAnnounceTurnMarkerAlias(),
            announcePlayerNames: Settings.getAnnouncePlayerNames(),
            // Start Marker Settings
            startMarkerEnabled: Settings.getIsEnabled("startmarker"),
            startMarkerPath: Settings.getStartMarkerPath()
        };
    }

    /**
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     */
    async _updateObject(e, d) {
        console.log('Turn Marker | Saving Settings');
        // Turnmarker settings
        Settings.setRatio(d.ratio);
        if (d.image) Settings.setImage("turnmarker", d.image);
        Settings.setCustomImagePath(d.customImage);
        Settings.setIsEnabled("turnmarker", d.turnMarkerEnabled);

        // Announcement Settings
        Settings.setShouldAnnounceTurns(d.announce);
        Settings.setAnnounceActors(d.announceActors);
        Settings.setIncludeAnnounceImage(d.announceImage);
        Settings.setAnnounceTokenName(d.announceTokenName);
        Settings.setAnnounceTurnMarkerAlias(d.announceTurnMarkerAlias);
        Settings.setAnnouncePlayerNames(d.announcePlayerNames);
        Settings.setIsEnabled("startmarker", d.startMarkerEnabled);
        Settings.setStartMarkerPath(d.startMarkerPath);

        // Ondeck Marker Settings
        Settings.setDeckRatio(d.deckRatio);
        if (d.deckImage) Settings.setImage("deckmarker", d.deckImage);
        Settings.setCustomDeckImagePath(d.customDeckImage);
        Settings.setIsEnabled("deckmarker", d.onDeckMarkerEnabled);
        Settings.setDeckPlayersOnly(d.onDeckPlayersOnly);
    }

    activateListeners(html) {
        super.activateListeners(html);
        const markerSelect = html.find('#image');
        const customImage = html.find('#customImage');
        const markerImgPreview = html.find('#markerImgPreview');

        const onDeckMarkerSelect = html.find('#deckImage');
        const customDeckImage = html.find('#customDeckImage');
        const deckMarkerImgPreview = html.find('#onDeckMarkerImgPreview');

        this.updatePreview(html);

        if (markerSelect.length > 0) {
            markerSelect.on('change', event => {
                if (customImage[0].value.trim() == '') {
                    markerImgPreview.attr('src', Settings.getImageByIndex(Number(event.target.value)));
                }
            });
        }

        if (onDeckMarkerSelect.length > 0) {
            onDeckMarkerSelect.on('change', event => {
                if (customDeckImage[0].value.trim() == '') {
                    deckMarkerImgPreview.attr('src', Settings.getDeckImageByIndex(Number(event.target.value)));
                }
            });
        }

        if (customImage.length > 0) {
            customImage.on('change', event => {
                this.updatePreview(html);
            });
        }

        if (customDeckImage.length > 0) {
            customDeckImage.on('change', event => {
                this.updatePreview(html);
            });
        }
    }

    updatePreview(html) {
        this._updateTurnmarkerPreview(html);
        this._updateOnDeckmarkerPreview(html);
    }

    /**
     Updates turnmarker preview
     **/
    _updateTurnmarkerPreview(html) {
        const markerSelect = html.find('#image');
        const customImage = html.find('#customImage');
        const markerImgPreview = html.find('#markerImgPreview');
        const markerVideoPreview = html.find('#markerVideoPreview');

        if (customImage[0].value.trim() == '') {
            markerSelect[0].disabled = false;
            markerImgPreview.attr('src', Settings.getImageByIndex(Number(markerSelect[0].value)));
            markerImgPreview.removeClass('hidden');
            markerVideoPreview.addClass('hidden');
        } else {
            markerSelect[0].disabled = true;
            const ext = this.getExtension(customImage[0].value);
            if (videos.includes(ext.toLowerCase())) {
                markerVideoPreview.attr('src', customImage[0].value);
                markerImgPreview.addClass('hidden');
                markerVideoPreview.removeClass('hidden');
            } else {
                markerImgPreview.attr('src', customImage[0].value);
                markerImgPreview.removeClass('hidden');
                markerVideoPreview.addClass('hidden');
            }
        }
    }

    _updateOnDeckmarkerPreview(html) {
        const onDeckMarkerSelect = html.find('#deckImage');
        const customDeckImage = html.find('#customDeckImage');
        const deckMarkerImgPreview = html.find('#onDeckMarkerImgPreview');
        const deckMarkerVideoPreview = html.find('#onDeckMarkerVideoPreview');

        if (customDeckImage[0].value.trim() == '') {
            onDeckMarkerSelect[0].disabled = false;
            deckMarkerImgPreview.attr('src', Settings.getDeckImageByIndex(Number(onDeckMarkerSelect[0].value)));
            deckMarkerImgPreview.removeClass('hidden');
            deckMarkerVideoPreview.addClass('hidden');
        } else {
            onDeckMarkerSelect[0].disabled = true;
            const ext = this.getExtension(customDeckImage[0].value);
            if (videos.includes(ext.toLowerCase())) {
                deckMarkerVideoPreview.attr('src', customDeckImage[0].value);
                deckMarkerImgPreview.addClass('hidden');
                deckMarkerVideoPreview.removeClass('hidden');
            } else {
                deckMarkerImgPreview.attr('src', customDeckImage[0].value);
                deckMarkerImgPreview.removeClass('hidden');
                deckMarkerVideoPreview.addClass('hidden');
            }
        }
    }

    getExtension(filePath) {
        return filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    getSelectList(array, selected) {
        let options = [];
        array.forEach((x, i) => {
            options.push({value: x, selected: i == selected});
        });
        return options;
    }
}

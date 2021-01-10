import { imageTitles, announcedActorOptions, Settings } from './settings.js';

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
            turnMarkerEnabled: Settings.getTurnMarkerEnabled(),
            ratio: Settings.getRatio(),
            image: this.getSelectList(imageTitles, Settings.getImageIndex()),
            announceActors: this.getSelectList(announcedActorOptions, Settings.getAnnounceActors()),
            customImage: Settings.getCustomImagePath(),
            announce: Settings.shouldAnnounceTurns(),
            announceImage: Settings.getIncludeAnnounceImage(),
            announceTokenName :Settings.getAnnounceTokenName(),
            startMarkerEnabled: Settings.getStartMarkerEnabled(),
            startMarkerPath: Settings.getStartMarkerPath(),
            previewPath: Settings.getImagePath()
        };
    }

    /** 
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     */
    async _updateObject(e, d) {
        console.log('Turn Marker | Saving Settings');
        Settings.setRatio(d.ratio);
        if (d.image) Settings.setImage(d.image);
        Settings.setCustomImagePath(d.customImage);
        Settings.setShouldAnnounceTurns(d.announce);
        Settings.setAnnounceActors(d.announceActors);
        Settings.setIncludeAnnounceImage(d.announceImage);
        Settings.setAnnounceTokenName(d.announceTokenName);
        Settings.setTurnMarkerEnabled(d.turnMarkerEnabled);
        Settings.setStartMarkerEnabled(d.startMarkerEnabled);
        Settings.setStartMarkerPath(d.startMarkerPath);
    }

    activateListeners(html) {
        super.activateListeners(html);
        const markerSelect = html.find('#image');
        const customImage = html.find('#customImage');
        const markerImgPreview = html.find('#markerImgPreview');

        this.updatePreview(html);

        if (markerSelect.length > 0) {
            markerSelect.on('change', event => {
                if (customImage[0].value.trim() == '') {
                    markerImgPreview.attr('src', Settings.getImageByIndex(Number(event.target.value)));
                }
            });
        }

        if (customImage.length > 0) {
            customImage.on('change', event => {
                this.updatePreview(html);
            });
        }
    }

    updatePreview(html) {
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
            console.warn(ext);
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

    getExtension(filePath) {
        return filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    getSelectList(array, selected) {
        let options = [];
        array.forEach((x, i) => {
            options.push({ value: x, selected: i == selected });
        });
        return options;
    }
}
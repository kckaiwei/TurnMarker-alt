import { Settings } from './settings.js';

export function renderUpdateWindow() {
    const module = game.modules.get("turnmarker");

    if (!isNewerVersion(module.data.version, Settings.getVersion()))
        return;

    class UpdateWindow extends Application {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                template: `modules/${module.id}/templates/updateWindow.html`,
                resizable: false,
                width: 500,
                height: 600,
                classes: ["updateWindow"],
                title: `${module.data.title} - Updated`
            });
        }

        getData() {
            return {
                version: module.data.version
            };
        }

        activateListeners(html) {
            super.activateListeners(html);

            html.find('.show-again').on('change', ev => {
                Settings.setVersion(ev.currentTarget.checked ? module.data.version : oldVersion);
            });
        }
    }

    new UpdateWindow().render(true);
}
import { Settings } from './settings.js';
import { modName } from './utils.js';

export function renderUpdateWindow() {
    const module = game.modules.get(modName);

    if (!isNewerVersion(module.version, Settings.getVersion()))
        return;

    class UpdateWindow extends Application {
        static get defaultOptions() {
            return mergeObject(super.defaultOptions, {
                template: `modules/${module.id}/templates/updateWindow.html`,
                resizable: false,
                width: 500,
                height: 600,
                classes: ["updateWindow"],
                title: `${module.title} - Updated`
            });
        }

        getData() {
            return {
                version: module.version
            };
        }

        activateListeners(html) {
            super.activateListeners(html);

            html.find('.show-again').on('change', ev => {
                Settings.setVersion(ev.currentTarget.checked ? module.version : null);
            });
        }
    }

    new UpdateWindow().render(true);
}

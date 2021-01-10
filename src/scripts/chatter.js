import { Settings } from "./settings.js";

export class Chatter {

    static sendTurnMessage(combatant, hideNPC_name=false) {
        let players = [];
        combatant.players.forEach(player => {
            players.push(player.name);
        });
        if (players.length == 0) players.push("GM");
        let combatantName = combatant.actor.name;
        let aliasName = combatantName;
        if (Settings.getAnnounceTokenName()) {
            combatantName = combatant.token.name;
            aliasName = combatant.name;
        }
        if (hideNPC_name && !combatant.actor.hasPlayerOwner) {
            combatantName = "???";
        }

        ChatMessage.create({
            speaker: { actor: combatant.actor, alias: aliasName },
            //speaker: { actor: {}, alias: 'Turn Marker' },
            content:
                `<div class="flexrow">${this.placeImage(combatant)}
                    <div style="flex: 12;">
                        <h2>${combatantName}'s Turn</h2>
                        <p>${players.join(' - ')}</p>
                    </div>
                    </div><em>Turn Marker</em>`
        });
    }

    static placeImage(combatant) {
        if (Settings.getIncludeAnnounceImage()) {
            let img = combatant.img;
            if (combatant.flags.core && combatant.flags.core.thumb) {
                img = combatant.flags.core.thumb;
            }
            return `<div style="flex:3;"><img src="${img}" style="border: none;" /></div>`;
            // return `<div style="flex:3;"><video><source="${combatant.img}"></video></div>`;
        } else return '';
    }
}
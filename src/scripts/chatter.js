import { Settings } from "./settings.js";

export class Chatter {

    static sendTurnMessage(combatant, hideNPC_name=false) {
        const announceLabel = game.i18n.localize("tm.announceLabel");
        let combatantName = combatant.actor.name;
        let aliasName = combatantName;
        if (Settings.getAnnounceTokenName()) {
            combatantName = combatant.token.name;
            aliasName = combatant.name;
        }

        let announceText;
        if (Settings.getAnnounceTurnMarkerAlias()) {
            aliasName = announceLabel;
            announceText = "";
        } else {
            announceText = `<em>${announceLabel}</em>`;
        }

        let playerNameDisplay;
        if (Settings.getAnnouncePlayerNames()) {
          let players = [];
          combatant.players.forEach(player => {
              players.push(player.name);
          });
          if (players.length == 0) players.push("GM");
          playerNameDisplay = `<p>${players.join(' - ')}</p>`;
        } else {
          playerNameDisplay = "";
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
                        ${playerNameDisplay}
                    </div>
                    </div>${announceText}`
        });
    }

    static placeImage(combatant) {
        if (Settings.getIncludeAnnounceImage()) {
            let img = combatant.img;
            if (combatant.actor.data.img) {
                img = combatant.actor.data.img;
            }
            return `<div style="flex:3;padding-right:4px"><img src="${img}" style="border: none;" /></div>`;
        } else return '';
    }
}

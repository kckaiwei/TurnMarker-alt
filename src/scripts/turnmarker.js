import {Chatter} from './chatter.js';
import {Marker} from './marker.js';
import {MarkerAnimation} from './markeranimation.js';
import {Settings} from './settings.js';
import {renderUpdateWindow} from './updateWindow.js';
import {firstGM, Flags, FlagScope, socketAction, socketName} from './utils.js';


let lastTurn = '';

Hooks.once('init', () => {
    Settings.registerSettings();
});

Hooks.once('ready', () => {
    if (game.user.isGM) {
        if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
            renderUpdateWindow();
        }
    }

    game.socket.on(socketName, async (data) => {
        if (game.user.isGM) {
            if (data) {
                const to_delete = canvas.tiles.placeables.find(t => t.id === data[0]);
                switch (data.mode) {
                    case socketAction.deleteStartMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        canvas.scene.setFlag(FlagScope, Flags.startMarkerPlaced, true);
                        break;
                    case socketAction.deleteTurnMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        break;
                    case socketAction.deleteDeckMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        break;
                }

            }
        }
    });
});

Hooks.on('canvasReady', () => {
    let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
        tile.parent.sortChildren();
        if (!game.paused && Settings.getShouldAnimate()) {
            MarkerAnimation.startAnimation();
        }
    }
});

Hooks.on('createTile', (scene, data) => {
    if (data.flags.turnMarker == true || data.flags.startMarker == true) {
        const tile = canvas.tiles.placeables.find(t => t.id === data._id);
        if (tile) {
            if (data.flags.turnMarker == true) {
                tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
                tile.parent.sortChildren();
                if (!game.paused && Settings.getShouldAnimate()) {
                    MarkerAnimation.startAnimation();
                }
            }
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('updateCombat', async (combat, update) => {
    // Clear out any leftovers, there seems to be a buggy instance where updateCombat is fired, when combat isn't
    // started nor, is a turn changed
    if (!combat.started) {
        await Marker.deleteStartMarker();
    }
    if (combat.combatant) {
        if (update && lastTurn != combat.combatant._id && game.user.isGM && game.userId == firstGM()) {
            lastTurn = combat.combatant._id;
            if (combat && combat.combatant && combat.started) {
                await Marker.placeStartMarker(combat.combatant.token._id);
                let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
                await Marker.placeTurnMarker(combat.combatant.token._id, (tile && tile.id) || undefined);
                if (Settings.shouldAnnounceTurns() && !combat.combatant.hidden) {
                    switch (Settings.getAnnounceActors()) {
                        case 0:
                            Chatter.sendTurnMessage(combat.combatant);
                            break;
                        case 1:
                            if (combat.combatant.actor.hasPlayerOwner) {
                                Chatter.sendTurnMessage(combat.combatant);
                            }
                            break;
                        case 2:
                            if (!combat.combatant.actor.hasPlayerOwner) {
                                Chatter.sendTurnMessage(combat.combatant);
                            }
                            break;
                        case 3:
                            Chatter.sendTurnMessage(combat.combatant, true);
                    }
                }
            }
        }
    }
});

Hooks.on('deleteCombat', async () => {
    if (game.user.isGM) {
        await Marker.clearAllMarkers();
    }
    MarkerAnimation.stopAnimation();
});

Hooks.on('updateToken', async (scene, updateToken, updateData) => {
    /*
    Moving preUpdateToken logic here, since pre hooks induce race conditions
     */
    let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) &&
            (game && game.combat && game.combat.combatant && game.combat.combatant.tokenId == updateToken._id) &&
            game.user.isGM && game.combat) {
            await Marker.moveMarkerToToken(updateToken._id, tile.id);
            tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            tile.parent.sortChildren();
        }
    }
});

function isVisible(tile) {
    if (tile.data.hidden) {
        return game.user.isGM;
    }

    if (!canvas.sight.tokenVision) {
        return true;
    }

    if (tile._controlled) {
        return true;
    }

    const combatant = canvas.tokens.placeables.find(t => t.id === game.combat.combatant.tokenId);

    if (!combatant || combatant.data.hidden) {
        return game.user.isGM;
    }

    if (combatant._controlled) {
        return true;
    }

    const ratio = Settings.getRatio();
    const w = tile.data.width / ratio;
    const h = tile.data.height / ratio;
    const tolerance = Math.min(w, h) / 4;

    return canvas.sight.testVisibility(tile.center, {tolerance, object: tile});
}

Hooks.on('updateTile', (entity, data, options, userId) => {
    if (data.flags.turnMarker || data.flags.startMarker) {
        const tile = canvas.tiles.placeables.find(t => t.id === data._id);
        if (tile) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('sightRefresh', () => {
    for (const tile of canvas.tiles.placeables) {
        if (tile.data.flags.turnMarker || tile.data.flags.startMarker) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('pauseGame', (isPaused) => {
    if (!isPaused && Settings.getShouldAnimate() && canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true)) {
        MarkerAnimation.startAnimation();
    } else {
        MarkerAnimation.stopAnimation();
    }
});

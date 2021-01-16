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
});

Hooks.on('canvasReady', () => {
    let deckTile = canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true);
    if (deckTile) {
        deckTile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
        deckTile.parent.sortChildren();
        if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
            MarkerAnimation.startAnimation("deckmarker");
        }
    }

    let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
        tile.parent.sortChildren();
        if (!game.paused && Settings.getShouldAnimate("turnmarker")) {
            MarkerAnimation.startAnimation("turnmarker");
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
                if (!game.paused && Settings.getShouldAnimate("turnmarker")) {
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
        let currentTurn = combat.turn;
        let nextTurn = currentTurn + 1;
        if (nextTurn >= combat.turns.length) {
            nextTurn = 0;
        }
        if (update && lastTurn != combat.combatant._id && game.user.isGM && game.userId == firstGM()) {
            lastTurn = combat.combatant._id;
            if (combat && combat.combatant && combat.started) {
                await Marker.placeStartMarker(combat.combatant.token._id);
                let deckTile = canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true);
                await Marker.placeOnDeckMarker(combat.turns[nextTurn].token._id);
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

    // Do onDeck first, so current token will have higher Z-index
    let deckTile = canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true);
    if (deckTile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) &&
            (game && game.combat) &&
            game.user.isGM && game.combat) {
            let currentTurn = game.combat.turn
            let nextTurn = currentTurn + 1;
            if (nextTurn >= game.combat.turns.length) {
                nextTurn = 0;
            }
            let nextToken = game.combat.turns[nextTurn].token
            await Marker.moveMarkerToToken(nextToken._id, deckTile.id);
            deckTile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            deckTile.parent.sortChildren();
        }
    }


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

    let marker_type = "turnmarker";
    if (tile.data.flags.startMarker) {
        marker_type = "startmarker";
    } else if (tile.data.flags.deckMarker) {
        marker_type = "deckmarker";
    }

    const ratio = Settings.getRatio(marker_type);
    const w = tile.data.width / ratio;
    const h = tile.data.height / ratio;
    const tolerance = Math.min(w, h) / 4;

    return canvas.sight.testVisibility(tile.center, {tolerance, object: tile});
}

Hooks.on('updateTile', (entity, data, options, userId) => {
    if (data.flags.turnMarker || data.flags.startMarker || data.flags.deckMarker) {
        const tile = canvas.tiles.placeables.find(t => t.id === data._id);
        if (tile) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('sightRefresh', () => {
    for (const tile of canvas.tiles.placeables) {
        if (tile.data.flags.turnMarker || tile.data.flags.startMarker || tile.data.flags.deckMarker) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('pauseGame', (isPaused) => {
    if (!isPaused) {
        if (Settings.getShouldAnimate("turnmarker") && canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true)) {
            MarkerAnimation.startAnimation("turnmarker");
        }
        if (Settings.getShouldAnimate("deckmarker") && canvas.tiles.placeables.find(t => t.data.flags.deckMarker == true)) {
            MarkerAnimation.startAnimation("deckmarker");
        }
    } else {
        MarkerAnimation.stopAllAnimation();
    }
});

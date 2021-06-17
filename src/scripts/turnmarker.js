import {Chatter} from './chatter.js';
import {Marker} from './marker.js';
import {MarkerAnimation} from './markeranimation.js';
import {Settings} from './settings.js';
import {renderUpdateWindow} from './updateWindow.js';
import {firstGM, Flags, FlagScope, socketAction, socketName, getNextTurn} from './utils.js';


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

    // Clean up any leftover markers before start, and remake since sometimes tiles get desync'd it seems
    Marker.clearAllMarkers();
    if (game.combat) {
        handleCombatUpdate(game.combat, true);
    }

    game.socket.on(socketName, async (data) => {
        if (game.user.isGM) {
            if (data) {
                const to_delete = canvas.background.tiles.find(t => t.id === data[0]);
                switch (data.mode) {
                    case socketAction.deleteStartMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        canvas.scene.setFlag(FlagScope, Flags.startMarkerPlaced, true);
                        break;
                    case socketAction.deleteTurnMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        break;
                    case socketAction.deleteOnDeckMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        break;
                }

            }
        }
    });
});

Hooks.on('canvasReady', () => {
    let deckTile = canvas.background.tiles.find(t => t.data.flags.deckMarker == true);
    if (deckTile) {
        deckTile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
        deckTile.parent.sortChildren();
        if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
            MarkerAnimation.startAnimation("deckmarker");
        }
    }

    let tile = canvas.background.tiles.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        tile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
        tile.parent.sortChildren();
        if (!game.paused && Settings.getShouldAnimate("turnmarker")) {
            MarkerAnimation.startAnimation("turnmarker");
        }
    }
});

Hooks.on('createTile', (tileDoc) => {
    if (tileDoc.data.flags.turnMarker == true || tileDoc.data.flags.startMarker == true) {
        const tile = canvas.background.tiles.find(t => t.id === tileDoc.data._id);
        if (tile) {
            if (tileDoc.data.flags.deckMarker == true) {
                tile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
                tile.parent.sortChildren();
                if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimation("deckmarker");
                }
            }
            else if (tileDoc.data.flags.turnMarker == true) {
                tile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
                tile.parent.sortChildren();
                if (!game.paused && Settings.getShouldAnimate("turnmarker")) {
                    MarkerAnimation.startAnimation("turnmarker");
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
    // SWADE has a special initiative
    if (game.system.id != "swade") {
        handleCombatUpdate(combat, update);
    }
});

// For SWADE, need to reget active player after each round, but no better hook is fired after initiative shuffle
Hooks.on("renderCombatTracker", async (combatTracker, update) => {
    if (game.system.id == "swade") {
        handleCombatUpdate(combatTracker.viewed, update)
    }
});

Hooks.on('deleteCombat', async () => {
    if (game.user.isGM) {
        await Marker.clearAllMarkers();
    }
    MarkerAnimation.stopAllAnimation();
});

Hooks.on('updateToken', async (tokenDoc, updateData, diff, id) => {
    /*
    Moving preUpdateToken logic here, since pre hooks induce race conditions
     */

    // Do onDeck first, so current token will have higher Z-index
    let deckTile = canvas.background.tiles.find(t => t.data.flags.deckMarker == true);
    if (deckTile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) &&
            (game && game.combat) &&
            game.user.isGM && game.combat) {
            let currentTurn = game.combat.turn;
            let nextTurn = currentTurn + 1;
            if (nextTurn >= game.combat.turns.length) {
                nextTurn = 0;
            }
            let nextToken = game.combat.turns[nextTurn].token;
            await Marker.moveMarkerToToken(nextToken._id, deckTile.id, "deckmarker");
            deckTile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
            deckTile.parent.sortChildren();
        }
    }


    let tile = canvas.background.tiles.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) &&
            (game && game.combat && game.combat.combatant && game.combat.combatant._token.data._id == updateData._id) &&
            game.user.isGM && game.combat) {
            await Marker.moveMarkerToToken(updateData._id, tile.data._id, "turnmarker");
            tile.zIndex = Math.max(...canvas.background.tiles.map(o => o.zIndex)) + 1;
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

async function createCombatDeckMarker(combat, nextTurn) {
    if (Settings.getDeckPlayersOnly()) {
        if (combat.turns[nextTurn].actor.hasPlayerOwner) {
            await Marker.placeOnDeckMarker(combat.turns[nextTurn].token._id).then(function () {
                if (Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimation("deckmarker");
                }
            });
        } else {
            await Marker.deleteOnDeckMarker();
        }
    } else {
        await Marker.placeOnDeckMarker(combat.turns[nextTurn].token._id).then(function () {
                if (Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimation("deckmarker");
                }
        });
    }
}

async function handleCombatUpdate(combat, update) {
    if (combat.combatant) {
        let nextTurn = getNextTurn(combat);
        if (update && lastTurn != combat.combatant._id && game.user.isGM && game.userId == firstGM()) {
            lastTurn = combat.combatant._id;
            if (combat && combat.combatant && combat.started) {
                await Marker.placeStartMarker(combat.combatant.token._id);
                createCombatDeckMarker(combat, nextTurn);
                let tile = canvas.background.tiles.find(t => t.data.flags.turnMarker == true);
                await Marker.placeTurnMarker(combat.combatant.token._id, (tile && tile.id) || undefined);
                if (Settings.shouldAnnounceTurns() && !combat.combatant.hidden) {
                    switch (Settings.getAnnounceActors()) {
                        case 0:
                            Chatter.sendTurnMessage(combat.combatant);
                            break;
                        case 1:
                            if (combat.combatant.actor.hasPlayerOwner) {
                                Chatter.sendTurnMessage(combat.combatant);
                                if (Settings.shouldPlayNotification()) {
                                    AudioHelper.play({src: "modules/turnmarker/sound/celesta_turn.mp3"})
                                }
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
}

Hooks.on('updateTile', (tileDoc) => {
    if (tileDoc.data.flags.turnMarker || tileDoc.data.flags.startMarker || tileDoc.data.flags.deckMarker) {
        const tile = canvas.background.tiles.find(t => t.id === tileDoc.data._id);
        if (tile) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('sightRefresh', () => {
    for (const tile of canvas.background.tiles) {
        if (tile.data.flags.turnMarker || tile.data.flags.startMarker || tile.data.flags.deckMarker) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('pauseGame', (isPaused) => {
    if (!isPaused) {
        if (Settings.getShouldAnimate("turnmarker") && canvas.background.tiles.find(t => t.data.flags.turnMarker == true)) {
            MarkerAnimation.startAnimation("turnmarker");
        }
        if (Settings.getShouldAnimate("deckmarker") && canvas.background.tiles.find(t => t.data.flags.deckMarker == true)) {
            MarkerAnimation.startAnimation("deckmarker");
        }
    } else {
        MarkerAnimation.stopAllAnimation();
    }
});

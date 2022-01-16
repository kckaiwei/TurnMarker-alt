import {Chatter} from './chatter.js';
import {Marker} from './marker.js';
import {MarkerAnimation} from './markeranimation.js';
import {Settings} from './settings.js';
import {renderUpdateWindow} from './updateWindow.js';
import {deleteTile, firstGM, socketName, getNextTurn} from './utils.js';


let lastTurn = '';

Hooks.once('init', () => {
    Settings.registerSettings();
});

Hooks.once('ready', async () => {
    if (game.user.isGM) {
        if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
            renderUpdateWindow();
        }
    }

    game.socket.on(socketName, async (data) => {
        if (game.user.isGM) {
            if (data.mode) {
                deleteTile({ mode: data.mode });
            }
        } else if (data.startAnimation) {
            MarkerAnimation.startAnimation(data.startAnimation)
        } else if (data.stopAnimation) {
            MarkerAnimation.stopAnimation(data.stopAnimation)
        } else if (data.stopAllAnimation) {
            MarkerAnimation.stopAllAnimation()
        }
    });

    if (game.user.isGM) {
        // Clean up any leftover markers before start, and remake since sometimes tiles get desync'd it seems
        await Marker.clearAllMarkers();
        if (game.combat) {
            handleCombatUpdate(game.combat, true);
        }
    }
    if (!game.paused) {
        const tiles = canvas.scene.getEmbeddedCollection('Tile');
        if (Settings.getShouldAnimate('turnmarker') && tiles?.find(t => t.data.flags?.turnMarker === true)) {
            MarkerAnimation.startAnimation('turnmarker');
        }
        if (Settings.getShouldAnimate('deckmarker') && tiles?.find(t => t.data.flags?.deckMarker === true)) {
            MarkerAnimation.startAnimation('deckmarker');
        }
    }
});

Hooks.on('updateCombat', async (combat, update) => {
    // Clear out any leftovers, there seems to be a buggy instance where updateCombat is fired, when combat isn't
    // started nor, is a turn changed
    if (!combat.started) {
        await Marker.clearAllMarkers();
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
    await Marker.clearAllMarkers();
    MarkerAnimation.stopAllAnimationGM();
});

Hooks.on('updateToken', async (tokenDoc, updateData, diff, id) => {
    /*
     Moving preUpdateToken logic here, since pre hooks induce race conditions
     */

    // Do onDeck first, so current token will have higher Z-index
    const tiles = canvas.scene.getEmbeddedCollection('Tile');
    let tile = tiles?.find(t => t.data.flags?.deckMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) && game.combat && game.user.isGM && game.userId === firstGM()) {
            const nextTurn = getNextTurn(game.combat);
            const nextToken = game.combat.turns[nextTurn].token;
            await Marker.moveMarkerToToken(nextToken.id, tile.id, 'deckmarker');
        }
    }

    tile = tiles?.find(t => t.data.flags?.turnMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) && game.combat?.combatant?.token.id === updateData._id && game.user.isGM && game.userId === firstGM()) {
            await Marker.moveMarkerToToken(updateData._id, tile.id, 'turnmarker');
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

    const combatant = canvas.scene.tokens.find(t => t.id === game.combat?.combatant.token.id);

    if (!combatant || combatant.data.hidden) {
        return game.user.isGM;
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

async function createCombatDeckMarker(combat) {
    const nextTurn = getNextTurn(combat);
    if (Settings.getDeckPlayersOnly()) {
        if (combat.turns[nextTurn].actor.hasPlayerOwner) {
            await Marker.placeOnDeckMarker(combat.turns[nextTurn].token.id).then(function () {
                if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimationGM("deckmarker");
                }
            });
        } else {
            await Marker.deleteOnDeckMarker();
        }
    } else {
        await Marker.placeOnDeckMarker(combat.turns[nextTurn].token.id).then(function () {
                if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimationGM("deckmarker");
                }
        });
    }
}

async function handleCombatUpdate(combat, update) {
    if (combat.combatant) {
        if (update && lastTurn != combat.combatant.id && game.user.isGM && game.userId == firstGM()) {
            if (combat && combat.combatant && combat.started) {
                lastTurn = combat.combatant.id;
                await Marker.placeStartMarker(combat.combatant.token.id);
                await createCombatDeckMarker(combat);
                await Marker.placeTurnMarker(combat.combatant.token.id).then(function () {
                    if (!game.paused && Settings.getShouldAnimate("turnmarker")) {
                        MarkerAnimation.startAnimationGM("turnmarker");
                    }
                });
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
}

Hooks.on('updateTile', (tileDoc) => {
    if (tileDoc.data.flags?.turnMarker || tileDoc.data.flags?.startMarker || tileDoc.data.flags?.deckMarker) {
        const tile = canvas.background.tiles.find(t => t.id === tileDoc.data.id);
        if (tile) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('sightRefresh', () => {
    for (const tile of canvas.background.tiles) {
        if (tile.data.flags?.turnMarker || tile.data.flags?.startMarker || tile.data.flags?.deckMarker) {
            tile.renderable = isVisible(tile);
        }
    }
});

Hooks.on('pauseGame', (isPaused) => {
    if (!isPaused) {
        if (Settings.getShouldAnimate("turnmarker") && canvas.scene.getEmbeddedCollection('Tile')?.find(t => t.data.flags?.turnMarker === true)) {
            MarkerAnimation.startAnimation("turnmarker");
        }
        if (Settings.getShouldAnimate("deckmarker") && canvas.scene.getEmbeddedCollection('Tile')?.find(t => t.data.flags?.deckMarker === true)) {
            MarkerAnimation.startAnimation("deckmarker");
        }
    } else {
        MarkerAnimation.stopAllAnimation();
    }
});
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
                    case socketAction.deleteOnDeckMarker:
                        await canvas.scene.deleteEmbeddedEntity('Tile', to_delete);
                        break;
                }

            }
        }
    });
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
    if (data.flags.turnMarker == true || data.flags.startMarker == true || data.flags.deckMarker == true) {
        const tile = canvas.tiles.placeables.find(t => t.id === data._id);
        if (tile) {
            if (data.flags.deckMarker == true) {
                tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
                tile.parent.sortChildren();
                if (!game.paused && Settings.getShouldAnimate("deckmarker")) {
                    MarkerAnimation.startAnimation("deckmarker");
                }
            } else if (data.flags.turnMarker == true) {
                tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
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
    if (combat.combatant) {
        let nextTurn = getNextTurn(combat);
        if (update && lastTurn != combat.combatant._id && game.user.isGM && game.userId == firstGM()) {
            lastTurn = combat.combatant._id;
            if (combat && combat.combatant && combat.started) {
                await Marker.placeStartMarker(combat.combatant.token._id);
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
    MarkerAnimation.stopAllAnimation();
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
            await Marker.moveMarkerToToken(nextToken._id, deckTile.id, "deckmarker");
            deckTile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            deckTile.parent.sortChildren();
        }
    }


    let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden) &&
            (game && game.combat && game.combat.combatant && game.combat.combatant.tokenId == updateToken._id) &&
            game.user.isGM && game.combat) {
            await Marker.moveMarkerToToken(updateToken._id, tile.id, "turnmarker");
            tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            tile.parent.sortChildren();
        }
    }

    setMarkerVisibilityAllTiles(updateToken);
});

function isVisible(tile) {
    if (!canvas.sight.tokenVision) {
        return true;
    }

    if (tile._controlled) {
        return true;
    }

    const combatant = canvas.tokens.placeables.find(t => t.id === game.combat.combatant.tokenId);

    let markerType = "turnmarker";
    if (tile.data.flags.startMarker) {
        markerType = "startmarker";
    } else if (tile.data.flags.deckMarker) {
        markerType = "deckmarker";
    }

    if (combatant.data.hidden) {
        if (markerType != "deckmarker") {
            return game.user.isGM;
        }
    }

    if (combatant._controlled) {
        return true;
    }

    const ratio = Settings.getRatio(markerType);
    const w = tile.data.width / ratio;
    const h = tile.data.height / ratio;
    const tolerance = Math.min(w, h) / 4;

    return canvas.sight.testVisibility(tile.center, {tolerance, object: tile});
}

/**
 * Sets marker visibility for all markers
 */
export function setMarkerVisibilityAllTiles(updateToken = null) {
    for (const tile of canvas.tiles.placeables) {
        if (tile.data.flags.turnMarker || tile.data.flags.startMarker || tile.data.flags.deckMarker) {
            let visible = isVisible(tile);
            tile.renderable = visible;
            tile.visible = visible;
            tile.data.hidden = !visible;
            // Alpha had to be set since for some reason, toggling renderable/visible, wasn't affecting turnMarker
            // when you show a token's visibility, so we check the updatedToken to determine the alpha.
            console.log(updateToken)
            console.log(tile)
            if (updateToken && updateToken._Id === tile.data.flags.tokenId) {
                if (!updateToken.hidden) {
                    tile.tile.img.alpha = 1
                } else {
                    tile.tile.img.alpha = 0.5
                }
            }
        }
    }
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
    setMarkerVisibilityAllTiles();
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

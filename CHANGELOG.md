# 2.6.9
- Fix console error when moving token outside of combat

# 2.6.8
- Test compatibility with Foundry v0.6.2
- Start marker if enabled will no longer show up until after a token has moved for the first time on it's turn
- Video files (webm, ogg, & mp4) should now properly display in the marker previewer in settings
- Added new informational window to be shown when module is updated
- Fix harmless error when setting custom image path for turn marker 
- Fix settings window not displaying logo

# 2.6.5
- Migrate repository from GitLab to GitHub
- Add Webpack to reduce overall script size

# 2.6.4
- Enable Japanese Language support
- Add option to disable Turn Marker
- Now properly removes the start marker from the canvas when combat ends
- Fix for webm token thumbnails not always displaying properly in turn announcements
- Fix for error when manually creating a combat from the combat tracker


# 2.6.3
- New optional feature: "Start Marker"
    - Places a static marker under the token when they start their turn to signify where they started
- German language support
- Korean language support
- Added file browsers to the settings window for image selection
- New setting to disable token image in turn announcements
- Added marker preview to settings window

# 2.6.2
- Moved global settings into their own window
- Add support for localization (translators desired!)

# 2.6.1
- Now properly integrates with Combat Utility Belt's 'Hide NPC Names' option
- Fix for multiple turn change messages when a combatant is removed from combat


# 2.6.0
- Now supports hex grids properly
- New feature: Setting to announce turn changes with a chat message

# 2.5.1
- Fix for error thrown when removing the last combatant from combat if combat has not started

# 2.5
- Updated for new tile structure in 0.5.6+

# 2.4.2
- Last release for 0.5.5-

# 2.4.1
- Ensure compatibility with 0.5.6

# 2.4
- Fix for marker misbehaving when token vision is disabled for a scene
- Fix for marker being visible when tokens are hidden

# 2.3
- Marker should now be hidden when the active combatant is hidden

# 2.2
- Fix for multiple markers being placed, but not updated when more than one GM is logged in
- Fix for error when changing image curing combat while player is connected

# 2.1
- Fix error when trying to change the marker image when no combat is active
- Fix error when moving a token outside of combat

# 2.0
- Change animation to be SIGNIFICANTLY smoother by using PIXI animations
- Remove "Animation Degrees" setting as it is no longer needed
- Marker should no longer hide behind other tiles on the canvas
- Each user can now define their own animation settings

# 1.0
- Initial Release
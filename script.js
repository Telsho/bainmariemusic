// script.js - Combined Logic (Including Merch & Updated Music Animation)
// Last updated: 2025-05-05 (Based on conversation)

console.log("Script start");

$(document).ready(function () {
    console.log("Document ready");

    // --- Cache jQuery Objects ---
    const $body = $('body');
    const $mapContainer = $('.map-container');
    const $map = $('#map');
    const $animatedElement = $('#home-animated'); // Main looping video
    const $contactInfo = $('#contact-info');
    const $backButton = $('#back-button'); // Contact back button

    const $musicVideoElement = $('#music-video'); // Music forward animation
    const $musicVideoReverseElement = $('#music-video-reverse'); // Music reverse animation
    const $musicFrameContainer = $('#music-iframe-container'); // Inner container for iframe/button
    const $musicPlayerWrapper = $('#music-player-wrapper');   // *** The outer wrapper for visibility/clipping ***
    const $musicIframe = $('#music-iframe');
    const $musicBackButton = $('#music-back-button'); // Music back button

    // Merch Elements
    const $merchVideoElement = $('#merch-video'); // Merch forward animation
    const $merchVideoReverseElement = $('#merch-video-reverse'); // Merch reverse animation
    const $merchContentContainer = $('#merch-content-container'); // Merch widget container
    const $merchBackButton = $('#merch-back-button'); // Merch back button

    // --- Original Dimensions (Check if these are still correct for your map image/video) ---
    // Note: These ratios are used for hover/click detection, ensure they match your map overlay PNGs
    const originalWidth = 957;
    const originalHeight = 879;

    // --- Hotspot Definitions ---
    const hotspots = [
        { name: 'music', overlaySelector: '#music-hover-overlay', xMinRatio: 60 / originalWidth, xMaxRatio: 290 / originalWidth, yMinRatio: 400 / originalHeight, yMaxRatio: 480 / originalHeight },
        { name: 'merch', overlaySelector: '#merch-hover-overlay', xMinRatio: 540 / originalWidth, xMaxRatio: 750 / originalWidth, yMinRatio: 140 / originalHeight, yMaxRatio: 210 / originalHeight },
        { name: 'contact', overlaySelector: '#contact-hover-overlay', xMinRatio: 515 / originalWidth, xMaxRatio: 800 / originalWidth, yMinRatio: 675 / originalHeight, yMaxRatio: 735 / originalHeight }
    ];
    const contactHotspot = hotspots.find(spot => spot.name === 'contact');
    const musicHotspot = hotspots.find(spot => spot.name === 'music');
    const merchHotspot = hotspots.find(spot => spot.name === 'merch');

    // --- Cache Overlay jQuery Objects & Check Elements ---
    const $overlays = {};
    let allElementsFound = true;

    hotspots.forEach(spot => {
        $overlays[spot.overlaySelector] = $(spot.overlaySelector);
        if ($overlays[spot.overlaySelector].length === 0) { console.error(`Overlay element (${spot.overlaySelector}) not found!`); allElementsFound = false; }
    });

    // Check other essential elements
    if ($body.length === 0) { console.error("Body element not found!"); allElementsFound = false; }
    if ($mapContainer.length === 0) { console.error("Map container .map-container not found!"); allElementsFound = false; }
    if ($animatedElement.length === 0) { console.error("Animated element #home-animated not found!"); allElementsFound = false; }
    if ($contactInfo.length === 0) { console.error("Contact info #contact-info not found!"); allElementsFound = false; }
    if ($backButton.length === 0) { console.error("Contact back button #back-button not found!"); allElementsFound = false; }
    // Music elements
    if ($musicVideoElement.length === 0) { console.error("Music video #music-video not found!"); allElementsFound = false; }
    if ($musicVideoReverseElement.length === 0) { console.error("Reverse music video #music-video-reverse not found!"); allElementsFound = false; }
    if ($musicFrameContainer.length === 0) { console.error("Music iframe container #music-iframe-container not found!"); allElementsFound = false; }
    if ($musicPlayerWrapper.length === 0) { console.error("Music player wrapper #music-player-wrapper not found!"); allElementsFound = false; } // *** Check Wrapper ***
    if ($musicIframe.length === 0) { console.error("Music iframe #music-iframe not found!"); allElementsFound = false; }
    if ($musicBackButton.length === 0) { console.error("Music back button #music-back-button not found!"); allElementsFound = false; }
    // Merch elements
    if ($merchVideoElement.length === 0) { console.error("Merch video #merch-video not found!"); allElementsFound = false; }
    if ($merchVideoReverseElement.length === 0) { console.error("Reverse merch video #merch-video-reverse not found!"); allElementsFound = false; }
    if ($merchContentContainer.length === 0) { console.error("Merch content container #merch-content-container not found!"); allElementsFound = false; }
    if ($merchBackButton.length === 0) { console.error("Merch back button #merch-back-button not found!"); allElementsFound = false; }
    // Hotspot data
    if (!contactHotspot) { console.error("Contact hotspot data not found!"); allElementsFound = false; }
    if (!musicHotspot) { console.error("Music hotspot data not found!"); allElementsFound = false; }
    if (!merchHotspot) { console.error("Merch hotspot data not found!"); allElementsFound = false; }


    // --- Setup Effects only if all elements exist ---
    if (allElementsFound) {

        const homeVideo = $animatedElement[0];
        const musicVideo = $musicVideoElement[0];
        const musicVideoReverse = $musicVideoReverseElement[0];
        const merchVideo = $merchVideoElement[0];
        const merchVideoReverse = $merchVideoReverseElement[0];

        let isTransitioning = false; // Flag to prevent clicks/hovers during transitions

        // --- Hover Effect Logic ---
        $animatedElement.on('mousemove', function (event) {
            // Ignore hover if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) {
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
                return;
            }

            const currentElementWidth = $animatedElement.width();
            const currentElementHeight = $animatedElement.height();
            if (currentElementWidth === 0 || currentElementHeight === 0) return;

            const elementOffset = $animatedElement.offset();
            const mouseX = event.pageX - elementOffset.left;
            const mouseY = event.pageY - elementOffset.top;

            let activeOverlaySelector = null;
            hotspots.forEach(spot => {
                const currentXMin = spot.xMinRatio * currentElementWidth;
                const currentXMax = spot.xMaxRatio * currentElementWidth;
                const currentYMin = spot.yMinRatio * currentElementHeight;
                const currentYMax = spot.yMaxRatio * currentElementHeight;
                const isInside = (mouseX >= currentXMin && mouseX <= currentXMax && mouseY >= currentYMin && mouseY <= currentYMax);
                if (isInside) {
                    activeOverlaySelector = spot.overlaySelector;
                }
            });

            hotspots.forEach(spot => {
                const $overlay = $overlays[spot.overlaySelector];
                if (spot.overlaySelector === activeOverlaySelector) {
                    $overlay.show();
                } else {
                    $overlay.hide();
                }
            });
        });

        // --- Mouse Leave Logic ---
        $animatedElement.on('mouseleave', function () {
             if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) return;
             hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
        });

        // --- Click Logic (Handles Contact, Music & Merch) ---
        $animatedElement.on('click', function (event) {
            // Ignore clicks if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) {
                console.log("Click ignored: Already in an active view or transition.");
                return;
            }

            const currentElementWidth = $animatedElement.width();
            const currentElementHeight = $animatedElement.height();
            if (currentElementWidth === 0 || currentElementHeight === 0) return;

            const elementOffset = $animatedElement.offset();
            const clickX = event.pageX - elementOffset.left;
            const clickY = event.pageY - elementOffset.top;

            // 1. Check CONTACT Click
            const currentContactXMin = contactHotspot.xMinRatio * currentElementWidth;
            const currentContactXMax = contactHotspot.xMaxRatio * currentElementWidth;
            const currentContactYMin = contactHotspot.yMinRatio * currentElementHeight;
            const currentContactYMax = contactHotspot.yMaxRatio * currentElementHeight;
            const isInsideContact = (clickX >= currentContactXMin && clickX <= currentContactXMax && clickY >= currentContactYMin && clickY <= currentContactYMax);

            if (isInsideContact) {
                console.log("Contact area clicked!");
                isTransitioning = true; // Start transition
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
                $mapContainer.addClass('contact-view-active'); // Hides home via CSS
                $animatedElement.addClass('gif-animate-forward'); // Animate home video out
                // Contact info appears automatically (not hidden by default)
                setTimeout(() => {
                    isTransitioning = false; // End transition after potential CSS animation
                }, 500); // Adjust timeout based on CSS transition/animation duration
                return; // Action handled
            }

            // 2. Check MUSIC Click
            const currentMusicXMin = musicHotspot.xMinRatio * currentElementWidth;
            const currentMusicXMax = musicHotspot.xMaxRatio * currentElementWidth;
            const currentMusicYMin = musicHotspot.yMinRatio * currentElementHeight;
            const currentMusicYMax = musicHotspot.yMaxRatio * currentElementHeight;
            const isInsideMusic = (clickX >= currentMusicXMin && clickX <= currentMusicXMax && clickY >= currentMusicYMin && clickY <= currentMusicYMax);

            if (isInsideMusic) {
                isTransitioning = true;
                console.log("Music area clicked! Starting music animation.");
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide()); // Hide overlays
                $animatedElement.removeClass('on-top'); // Ensure home z-index is reset
                homeVideo.pause(); // Pause background video
                $body.addClass('music-info-hidden'); // CSS hides contact/merch
                $mapContainer.addClass('music-view-active'); // CSS hides home video

                // Prepare music video FORWARD
                musicVideo.onended = null; // Clear previous listener
                musicVideo.pause();
                musicVideo.currentTime = 0;
                $musicVideoElement.removeClass('hide');
                console.log("Forward music video reset to 0 and revealed.");

                setTimeout(() => { // Use timeout 0 to ensure DOM updates apply before play
                    if (isTransitioning && $mapContainer.hasClass('music-view-active')) {
                        console.log("Timeout(0) fired: Playing forward music video.");
                        musicVideo.muted = false; // Play with sound
                        musicVideo.loop = false;
                        musicVideo.playbackRate = 1.5
                        musicVideo.play().then(() => {
                            console.log("Music video playing forward initiated.");
                        }).catch(error => {
                            console.error("Error playing forward music video:", error);
                            isTransitioning = false;
                            resetToDefaultView('music', true); // Force reset on error
                        });
                    } else {
                       console.log("Timeout(0) skipped for music: State changed.");
                    }
                }, 0);

                // Listener for when music video FINISHES
                musicVideo.onended = function () {
                    console.log("Forward music animation finished.");
                    musicVideo.onended = null; // Clean up listener
                    if ($mapContainer.hasClass('music-view-active')) { // Check if still in music view
                        $animatedElement.removeClass('on-top'); // Re-ensure home video z-index

                        // *** SHOW THE MUSIC PLAYER WRAPPER ***
                        $musicPlayerWrapper.addClass('player-visible'); // CSS handles inner slide-up

                        isTransitioning = false; // End transition state
                    } else {
                        console.log("Music video ended, but view was already reset.");
                        isTransitioning = false; // Still end transition state
                    }
                };
                return; // Action handled
            }

            // 3. Check MERCH Click
            const currentMerchXMin = merchHotspot.xMinRatio * currentElementWidth;
            const currentMerchXMax = merchHotspot.xMaxRatio * currentElementWidth;
            const currentMerchYMin = merchHotspot.yMinRatio * currentElementHeight;
            const currentMerchYMax = merchHotspot.yMaxRatio * currentElementHeight;
            const isInsideMerch = (clickX >= currentMerchXMin && clickX <= currentMerchXMax && clickY >= currentMerchYMin && clickY <= currentMerchYMax);

            if (isInsideMerch) {
                isTransitioning = true;
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide()); // Hide overlays
                $animatedElement.removeClass('on-top'); // Ensure home z-index is reset
                homeVideo.pause(); // Pause background video
                $body.addClass('merch-info-hidden'); // CSS hides contact/music
                $mapContainer.addClass('merch-view-active'); // CSS hides home video

                // Prepare merch video FORWARD
                merchVideo.onended = null;
                merchVideo.pause();
                merchVideo.currentTime = 0;
                $merchVideoElement.removeClass('hide');

                setTimeout(() => { // Timeout 0
                    if (isTransitioning && $mapContainer.hasClass('merch-view-active')) {
                        console.log("Timeout(0) fired: Playing forward merch video.");
                        merchVideo.muted = false;
                        merchVideo.loop = false;
                        merchVideo.playbackRate = 1.5; // Optional speed change
                        merchVideo.play().then(() => {
                            console.log("Merch video playing forward initiated.");
                        }).catch(error => {
                            console.error("Error playing forward merch video:", error);
                            isTransitioning = false;
                            resetToDefaultView('merch', true); // Force reset
                        });
                    } else {
                        console.log("Timeout(0) skipped for merch: State changed.");
                    }
                }, 0);

                // Listener for when merch video FINISHES
                merchVideo.onended = function () {
                    console.log("Forward merch animation finished.");
                    merchVideo.onended = null;
                     if ($mapContainer.hasClass('merch-view-active')) { // Check if still in merch view
                        $animatedElement.removeClass('on-top');
                        $merchContentContainer.addClass('merch-visible'); // Show merch content (fade)
                        isTransitioning = false; // End transition state
                     } else {
                         console.log("Merch video ended, but view was already reset.");
                         isTransitioning = false;
                     }
                };
                return; // Action handled
            }


            // 4. Clicked outside defined hotspots
            console.log("Clicked outside defined hotspots.");
        });


        // --- Unified Reset Function ---
        function resetToDefaultView(source, forceReset = false) {
            if (isTransitioning && !forceReset) {
                console.log("Reset ignored: Transition already in progress.");
                return;
            }
            isTransitioning = true; // Set flag for the whole reset sequence
            console.log(`Resetting to default view from: ${source}`);

            // --- Actions specific to resetting from MUSIC view ---
            if (source === 'music') {

                // 1. START INNER CONTAINER'S SLIDE-DOWN & KEEP WRAPPER VISIBLE
                console.log("Music Reset: Triggering player slide-down.");
                // Removing 'player-visible' starts the INNER container's CSS transform transition
                $musicPlayerWrapper.removeClass('player-visible');
                // ADD temporary class to keep the WRAPPER visible via CSS override
                $musicPlayerWrapper.addClass('keep-visible-during-slide');

                // 2. CALCULATE DURATION (based on CSS: 0.6s = 600ms)
                const slideDownDurationMs = 600; // *** MATCH CSS transition duration ***

                // 3. WAIT FOR SLIDE-DOWN TO FINISH
                setTimeout(() => {
                    console.log("Music Reset: Player slide-down finished (timeout).");

                    // *** Important: NOW remove the temporary visibility class from the WRAPPER ***
                    $musicPlayerWrapper.removeClass('keep-visible-during-slide');

                    // 4. PERFORM ACTIONS *AFTER* SLIDE-DOWN AND WRAPPER IS HIDDEN
                    // Pause/hide forward music video
                    musicVideo.pause();
                    musicVideo.currentTime = 0;
                    $musicVideoElement.addClass('hide');
                    console.log("Forward music video paused, reset, hidden.");

                    // Prepare home video state BEFORE playing reverse background
                    $animatedElement.removeClass('on-top hide gif-animate-forward');

                    // Prepare and play the REVERSE background video
                    console.log("Playing reverse background music video.");
                    musicVideoReverse.onended = null;
                    $musicVideoReverseElement.removeClass('hide');
                    musicVideoReverse.currentTime = 0;
                    musicVideoReverse.muted = false;
                    musicVideoReverse.loop = false;
                    musicVideoReverse.playbackRate = 2;

                    musicVideoReverse.play().then(() => {
                        // 5. ACTIONS *AFTER* REVERSE BACKGROUND VIDEO FINISHES
                        musicVideoReverse.onended = function() {
                            console.log("Reverse background music video finished.");
                            musicVideoReverse.onended = null;
                            musicVideoReverse.playbackRate = 1.0;
                            musicVideoReverse.pause();
                            musicVideoReverse.currentTime = 0;
                            $musicVideoReverseElement.addClass('hide');
                            $animatedElement.addClass('on-top');
                            performCommonResetTasks();
                            console.log("Music reset sequence complete.");
                            isTransitioning = false; // <<< END transition flag HERE
                        };
                    }).catch(error => {
                         console.error("Error playing reverse background music video:", error);
                         // Ensure temporary class is removed on error too
                         $musicPlayerWrapper.removeClass('keep-visible-during-slide');
                         musicVideoReverse.playbackRate = 1.0;
                         musicVideoReverse.pause();
                         musicVideoReverse.currentTime = 0;
                         $musicVideoReverseElement.addClass('hide');
                         $animatedElement.addClass('on-top');
                         performCommonResetTasks();
                         console.error("Music reset sequence completed with error.");
                         isTransitioning = false; // <<< END transition flag HERE on error too
                    });

                }, slideDownDurationMs); // End of setTimeout waiting for slide-down

            // --- Actions for CONTACT view ---
            } else if (source === 'contact') {
                // ... (Contact logic remains the same) ...
                 console.log("Contact Reset: Performing immediate reset.");
                 $animatedElement.removeClass('gif-animate-forward');
                 $animatedElement.removeClass('hide on-top');
                 performCommonResetTasks();
                 isTransitioning = false;

            // --- Actions for MERCH view ---
            } else if (source === 'merch') {
                // ... (Merch logic remains the same as previous step) ...
                 console.log("Merch Reset: Hiding content and playing reverse video.");
                 $merchContentContainer.removeClass('merch-visible');
                 const fadeOutDurationMs = 100; // Matches the 0.1s transition in CSS
                 setTimeout(() => {
                    merchVideo.pause();
                    merchVideo.currentTime = 0;
                    $merchVideoElement.addClass('hide');
                    $animatedElement.removeClass('on-top hide gif-animate-forward');
                    merchVideoReverse.onended = null;
                    $merchVideoReverseElement.removeClass('hide');
                    merchVideoReverse.currentTime = 0;
                    merchVideoReverse.muted = false;
                    merchVideoReverse.loop = false;
                    merchVideoReverse.playbackRate = 2;
                    merchVideoReverse.play().then(() => {
                        merchVideoReverse.onended = function() {
                            console.log("Reverse merch video finished.");
                            merchVideoReverse.onended = null;
                            merchVideoReverse.pause();
                            merchVideoReverse.currentTime = 0;
                            $merchVideoReverseElement.addClass('hide');
                            $animatedElement.addClass('on-top');
                            performCommonResetTasks();
                            console.log("Merch reset sequence complete.");
                            isTransitioning = false;
                        };
                    }).catch(error => {
                        console.error("Error playing reverse merch video:", error);
                        merchVideoReverse.pause();
                        merchVideoReverse.currentTime = 0;
                        $merchVideoReverseElement.addClass('hide');
                        $animatedElement.addClass('on-top');
                        performCommonResetTasks();
                        console.error("Merch reset sequence completed with error.");
                        isTransitioning = false;
                    });
                }, fadeOutDurationMs); // Wait for fade-out before playing reverse

            } else {
                 // Fallback / Unknown source
                 console.warn("Reset called with unknown source or state:", source);
                 $animatedElement.removeClass('hide gif-animate-forward on-top');
                 performCommonResetTasks();
                 isTransitioning = false;
            }
        }
        // --- Helper function for common reset tasks ---
        function performCommonResetTasks() {
            console.log("Performing common reset tasks...");

            // Pause/Reset transition videos state
            musicVideo.pause(); musicVideo.currentTime = 0; $musicVideoElement.addClass('hide');
            musicVideoReverse.pause(); musicVideoReverse.currentTime = 0; $musicVideoReverseElement.addClass('hide');
            merchVideo.pause(); merchVideo.currentTime = 0; $merchVideoElement.addClass('hide');
            merchVideoReverse.pause(); merchVideoReverse.currentTime = 0; $merchVideoReverseElement.addClass('hide');

            // Remove general state classes
            $mapContainer.removeClass('contact-view-active music-view-active merch-view-active');
            $body.removeClass('music-info-hidden merch-info-hidden');
            // Ensure temporary class is removed here too, just in case
            $musicPlayerWrapper.removeClass('player-visible keep-visible-during-slide');
            $merchContentContainer.removeClass('merch-visible');

            // Reset home video state (on-top handled by specific reset logic)
            $animatedElement.removeClass('hide gif-animate-forward');

            // Restart home video if appropriate
            if (!$mapContainer.hasClass('contact-view-active') && !$mapContainer.hasClass('music-view-active') && !$mapContainer.hasClass('merch-view-active')) {
                console.log("Restarting home video.");
                homeVideo.currentTime = 0;
                homeVideo.loop = true;
                homeVideo.muted = true; // Keep it muted
                homeVideo.play().catch(error => console.error("Error restarting home video:", error));
            } else {
                console.log("Home video restart skipped due to an active state lingering unexpectedly.");
            }
       } // End performCommonResetTasks

       // --- Back Button Event Handlers ---
       $backButton.on('click', function() { resetToDefaultView('contact'); });
       $musicBackButton.on('click', function() { resetToDefaultView('music'); });
       $merchBackButton.on('click', function() { resetToDefaultView('merch'); });

   } else {
       console.error("Essential elements missing. Full functionality disabled.");
   }

}); // End Document Ready

console.log("Script end");
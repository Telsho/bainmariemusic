// script.js - Combined Logic (Including Merch)

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
    const $musicFrameContainer = $('#music-iframe-container');
    const $musicIframe = $('#music-iframe');
    const $musicBackButton = $('#music-back-button'); // Music back button

    // *** NEW: Merch Elements ***
    const $merchVideoElement = $('#merch-video'); // Merch forward animation
    const $merchVideoReverseElement = $('#merch-video-reverse'); // Merch reverse animation
    const $merchContentContainer = $('#merch-content-container'); // Merch widget container
    const $merchBackButton = $('#merch-back-button'); // Merch back button

    // --- Original Dimensions (Check if these are still correct for your map image/video) ---
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
    const merchHotspot = hotspots.find(spot => spot.name === 'merch'); // *** NEW ***

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
    if ($musicVideoElement.length === 0) { console.error("Music video #music-video not found!"); allElementsFound = false; }
    if ($musicVideoReverseElement.length === 0) { console.error("Reverse music video #music-video-reverse not found!"); allElementsFound = false; }
    if ($musicFrameContainer.length === 0) { console.error("Music iframe container #music-iframe-container not found!"); allElementsFound = false; }
    if ($musicIframe.length === 0) { console.error("Music iframe #music-iframe not found!"); allElementsFound = false; }
    if ($musicBackButton.length === 0) { console.error("Music back button #music-back-button not found!"); allElementsFound = false; }
    // *** NEW: Check Merch Elements ***
    if ($merchVideoElement.length === 0) { console.error("Merch video #merch-video not found!"); allElementsFound = false; }
    if ($merchVideoReverseElement.length === 0) { console.error("Reverse merch video #merch-video-reverse not found!"); allElementsFound = false; }
    if ($merchContentContainer.length === 0) { console.error("Merch content container #merch-content-container not found!"); allElementsFound = false; }
    if ($merchBackButton.length === 0) { console.error("Merch back button #merch-back-button not found!"); allElementsFound = false; }

    if (!contactHotspot) { console.error("Contact hotspot data not found!"); allElementsFound = false; }
    if (!musicHotspot) { console.error("Music hotspot data not found!"); allElementsFound = false; }
    if (!merchHotspot) { console.error("Merch hotspot data not found!"); allElementsFound = false; } // *** NEW ***


    // --- Setup Effects only if all elements exist ---
    if (allElementsFound) {

        const homeVideo = $animatedElement[0];
        const musicVideo = $musicVideoElement[0];
        const musicVideoReverse = $musicVideoReverseElement[0];
        // *** NEW: Merch Video DOM Elements ***
        const merchVideo = $merchVideoElement[0];
        const merchVideoReverse = $merchVideoReverseElement[0];

        let isTransitioning = false; // Flag to prevent clicks/hovers during transitions

        // --- Hover Effect Logic ---
        $animatedElement.on('mousemove', function (event) {
            // Ignore hover if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) { // *** ADDED merch-view-active check ***
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
                return;
            }
            // ... (rest of hover logic remains the same)
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
                if (isInside) { activeOverlaySelector = spot.overlaySelector; }
            });
            hotspots.forEach(spot => {
                const $overlay = $overlays[spot.overlaySelector];
                if (spot.overlaySelector === activeOverlaySelector) $overlay.show();
                else $overlay.hide();
            });
        });

        // --- Mouse Leave Logic ---
        $animatedElement.on('mouseleave', function () {
             if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) return; // *** ADDED merch-view-active check ***
             hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
        });

        // --- Click Logic (Handles Contact, Music & Merch) ---
        $animatedElement.on('click', function (event) {
            // Ignore clicks if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || $mapContainer.hasClass('merch-view-active') || isTransitioning) { // *** ADDED merch-view-active check ***
                console.log("Click ignored: Already in an active view or transition.");
                return;
            }

            // ... (rest of click coordinate calculation remains the same)
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
                // $body.addClass('contact-info-hidden'); // Add if needed
                $animatedElement.addClass('gif-animate-forward'); // Animate home video out
                // Contact info display is handled by CSS/HTML structure (not hidden by default)
                setTimeout(() => { isTransitioning = false; }, 500); // Adjust timeout based on CSS transition/animation
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

                setTimeout(() => {
                    if (isTransitioning && $mapContainer.hasClass('music-view-active')) {
                        console.log("Timeout(0) fired: Playing forward music video.");
                        musicVideo.muted = false;
                        musicVideo.loop = false;
                        musicVideo.play().then(() => {
                            console.log("Music video playing forward initiated.");
                        }).catch(error => {
                            console.error("Error playing forward music video:", error);
                            isTransitioning = false;
                            resetToDefaultView('music', true); // Force reset
                        });
                    } else {
                       console.log("Timeout(0) skipped for music: State changed.");
                    }
                }, 0);

                // Listener for when music video FINISHES
                musicVideo.onended = function () {
                    console.log("Forward music animation finished.");
                    musicVideo.onended = null;
                    if ($mapContainer.hasClass('music-view-active')) { // Check if still in music view
                       $animatedElement.removeClass('on-top'); // Re-ensure home video z-index
                       $musicFrameContainer.addClass('iframe-visible'); // Show iframe
                       isTransitioning = false; // End transition state
                    } else {
                        console.log("Music video ended, but view was already reset.");
                        isTransitioning = false; // Still end transition state
                    }
                };
                return; // Action handled
            }

            // *** NEW: 3. Check MERCH Click ***
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
                merchVideo.onended = null; // Clear previous listener
                merchVideo.pause();
                merchVideo.currentTime = 0;
                $merchVideoElement.removeClass('hide');

                setTimeout(() => {
                    if (isTransitioning && $mapContainer.hasClass('merch-view-active')) {
                        console.log("Timeout(0) fired: Playing forward merch video.");
                        merchVideo.muted = false; // Play with sound if desired
                        merchVideo.loop = false;
                        merchVideo.playbackRate = 1.5;
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
                        $animatedElement.removeClass('on-top'); // Re-ensure home video z-index
                        $merchContentContainer.addClass('merch-visible'); // Show merch content
                        isTransitioning = false; // End transition state
                     } else {
                         console.log("Merch video ended, but view was already reset.");
                         isTransitioning = false; // Still end transition state
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
            isTransitioning = true;
            console.log(`Resetting to default view from: ${source}`);

            // --- Actions specific to resetting from MUSIC view ---
            if (source === 'music') {
                $musicFrameContainer.removeClass('iframe-visible'); // Hide iframe

                // Pause/hide forward music video
                musicVideo.pause();
                musicVideo.currentTime = 0;
                $musicVideoElement.addClass('hide');
                console.log("Forward music video paused, reset, hidden.");

                // Prepare home video state BEFORE playing reverse
                $animatedElement.removeClass('on-top hide gif-animate-forward');

                // Prepare and play the REVERSE music video
                console.log("Playing reverse music video.");
                musicVideoReverse.onended = null;
                $musicVideoReverseElement.removeClass('hide'); // Show reverse video
                musicVideoReverse.currentTime = 0;
                musicVideoReverse.muted = false; // Play with sound if desired
                musicVideoReverse.playbackRate = 2; // Speed up reverse

                musicVideoReverse.play().then(() => {
                    musicVideoReverse.onended = function() {
                        console.log("Reverse music video finished.");
                        musicVideoReverse.onended = null;
                        musicVideoReverse.playbackRate = 1.0;
                        musicVideoReverse.pause();
                        musicVideoReverse.currentTime = 0;
                        $musicVideoReverseElement.addClass('hide'); // Hide after playing

                        // Bring home video TO FRONT after reverse finishes
                        $animatedElement.addClass('on-top');
                        performCommonResetTasks(); // Cleanup classes & play home video
                        isTransitioning = false; // End transition
                    };
                }).catch(error => {
                     console.error("Error playing reverse music video:", error);
                     musicVideoReverse.playbackRate = 1.0;
                     musicVideoReverse.pause();
                     musicVideoReverse.currentTime = 0;
                     $musicVideoReverseElement.addClass('hide'); // Hide on error too
                     // Bring home video to top even on error
                     $animatedElement.addClass('on-top');
                     performCommonResetTasks();
                     isTransitioning = false;
                });

            // *** NEW: Actions specific to resetting from MERCH view ***
            } else if (source === 'merch') {
                 $merchContentContainer.removeClass('merch-visible'); // Hide merch content

                 // Pause/hide forward merch video
                 merchVideo.pause();
                 merchVideo.currentTime = 0;
                 $merchVideoElement.addClass('hide');
                 console.log("Forward merch video paused, reset, hidden.");

                 // Prepare home video state BEFORE playing reverse
                 $animatedElement.removeClass('on-top hide gif-animate-forward');

                 // Prepare and play the REVERSE merch video
                 console.log("Playing reverse merch video.");
                 merchVideoReverse.onended = null;
                 $merchVideoReverseElement.removeClass('hide'); // Show reverse video
                 merchVideoReverse.currentTime = 0;
                 merchVideoReverse.muted = false; // Play with sound if desired
                 merchVideoReverse.playbackRate = 2; // Optional: Speed up reverse

                 merchVideoReverse.play().then(() => {
                    merchVideoReverse.onended = function() {
                        console.log("Reverse merch video finished.");
                        merchVideoReverse.onended = null;
                        merchVideoReverse.pause();
                        merchVideoReverse.currentTime = 0;
                        $merchVideoReverseElement.addClass('hide'); // Hide after playing

                        // Bring home video TO FRONT after reverse finishes
                        $animatedElement.addClass('on-top');
                        performCommonResetTasks(); // Cleanup classes & play home video
                        isTransitioning = false; // End transition
                    };
                 }).catch(error => {
                     console.error("Error playing reverse merch video:", error);
                     // merchVideoReverse.playbackRate = 1.0; // Reset if changed
                     merchVideoReverse.pause();
                     merchVideoReverse.currentTime = 0;
                     $merchVideoReverseElement.addClass('hide'); // Hide on error too
                      // Bring home video to top even on error
                     $animatedElement.addClass('on-top');
                     performCommonResetTasks();
                     isTransitioning = false;
                 });

            } else if (source === 'contact') {
                // Resetting from Contact View
                // Contact info hides via body class removal in performCommonResetTasks
                // $mapContainer.removeClass('contact-view-active'); // Removed in common tasks
                $animatedElement.removeClass('gif-animate-forward'); // Stop animation class

                // Ensure home video is visible and NOT on top initially
                $animatedElement.removeClass('hide on-top');

                performCommonResetTasks();
                // No video transition for contact, reset state quickly
                isTransitioning = false; // End transition earlier for contact

            } else {
                // Fallback / Unknown source
                console.warn("Reset called with unknown source or state:", source);
                $animatedElement.removeClass('hide gif-animate-forward on-top');
                performCommonResetTasks();
                isTransitioning = false;
            }
        } // End resetToDefaultView

        // --- Helper function for common reset tasks ---
        function performCommonResetTasks() {
            console.log("Performing common reset tasks...");

            // Pause/Reset transition videos state
            musicVideo.pause();
            musicVideo.currentTime = 0;
            $musicVideoElement.addClass('hide');

            musicVideoReverse.pause();
            musicVideoReverse.currentTime = 0;
            $musicVideoReverseElement.addClass('hide'); // Ensure hidden

            // *** NEW: Reset Merch Videos ***
            merchVideo.pause();
            merchVideo.currentTime = 0;
            $merchVideoElement.addClass('hide');

            merchVideoReverse.pause();
            merchVideoReverse.currentTime = 0;
            $merchVideoReverseElement.addClass('hide'); // Ensure hidden


            // Remove general state classes from containers/body
            $mapContainer.removeClass('contact-view-active music-view-active merch-view-active'); // *** ADDED merch ***
            $body.removeClass('music-info-hidden merch-info-hidden'); // *** ADDED merch ***
            $musicFrameContainer.removeClass('iframe-visible');
            $merchContentContainer.removeClass('merch-visible'); // *** ADDED merch ***

            // Ensure home video element is displayed (remove potential hide/animate classes)
            // The 'on-top' class should be handled specifically by the reset source logic
            $animatedElement.removeClass('hide gif-animate-forward');

            // Restart home video (only if no other view is now active - safety check)
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
        $backButton.on('click', function() { resetToDefaultView('contact'); }); // Contact back
        $musicBackButton.on('click', function() { resetToDefaultView('music'); }); // Music back
        $merchBackButton.on('click', function() { resetToDefaultView('merch'); }); // *** NEW: Merch back ***


    } else {
        console.error("Essential elements missing. Full functionality disabled.");
    }


}); // End Document Ready

console.log("Script end");
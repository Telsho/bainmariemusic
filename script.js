// script.js - Combined Logic (Using Separate Reverse Video)

console.log("Script start");

$(document).ready(function () {
    console.log("Document ready");

    // --- Cache jQuery Objects ---
    const $body = $('body');
    const $mapContainer = $('.map-container');
    const $map = $('#map');
    const $animatedElement = $('#home-animated');
    const $contactInfo = $('#contact-info');
    const $backButton = $('#back-button'); // Contact back button
    const $musicVideoElement = $('#music-video'); // Forward animation
    const $musicVideoReverseElement = $('#music-video-reverse'); // *** NEW: Reverse animation element ***
    const $musicFrameContainer = $('#music-iframe-container');
    const $musicIframe = $('#music-iframe');
    const $musicBackButton = $('#music-back-button'); // Music back button

    // --- Original Dimensions ---
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
    if ($musicVideoReverseElement.length === 0) { console.error("Reverse music video #music-video-reverse not found!"); allElementsFound = false; } // *** Check for new element ***
    if ($musicFrameContainer.length === 0) { console.error("Music iframe container #music-iframe-container not found!"); allElementsFound = false; }
    if ($musicIframe.length === 0) { console.error("Music iframe #music-iframe not found!"); allElementsFound = false; }
    if ($musicBackButton.length === 0) { console.error("Music back button #music-back-button not found!"); allElementsFound = false; }
    if (!contactHotspot) { console.error("Contact hotspot data not found!"); allElementsFound = false; }
    if (!musicHotspot) { console.error("Music hotspot data not found!"); allElementsFound = false; }


    // --- Setup Effects only if all elements exist ---
    if (allElementsFound) {

        const homeVideo = $animatedElement[0];
        const musicVideo = $musicVideoElement[0];
        const musicVideoReverse = $musicVideoReverseElement[0]; // *** Get reverse video DOM element ***
        let isTransitioning = false; // Flag to prevent clicks/hovers during transitions

        // --- Hover Effect Logic ---
        $animatedElement.on('mousemove', function (event) {
            // Ignore hover if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || isTransitioning) {
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
             if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || isTransitioning) return;
             hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
        });

        // --- Click Logic (Handles Contact & Music) ---
        $animatedElement.on('click', function (event) {
            // Ignore clicks if a view is active or a transition is happening
            if ($mapContainer.hasClass('contact-view-active') || $mapContainer.hasClass('music-view-active') || isTransitioning) {
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
            // ... (contact click logic remains the same)
            const currentContactXMin = contactHotspot.xMinRatio * currentElementWidth;
            const currentContactXMax = contactHotspot.xMaxRatio * currentElementWidth;
            const currentContactYMin = contactHotspot.yMinRatio * currentElementHeight;
            const currentContactYMax = contactHotspot.yMaxRatio * currentElementHeight;
            const isInsideContact = (clickX >= currentContactXMin && clickX <= currentContactXMax && clickY >= currentContactYMin && clickY <= currentContactYMax);

            if (isInsideContact) {
                isTransitioning = true; // Start transition
                hotspots.forEach(spot => $overlays[spot.overlaySelector].hide());
                $mapContainer.addClass('contact-view-active');
                $animatedElement.addClass('gif-animate-forward');
                // Assuming CSS handles showing #contact-info based on contact-view-active
                // No video transition here, so set transitioning false quickly or based on CSS animation end
                setTimeout(() => { isTransitioning = false; }, 500); // Adjust timeout based on CSS
                return; // Action handled
            }


            // 2. Check MUSIC Click
            // ... (music click coordinate check remains the same)
            const currentMusicXMin = musicHotspot.xMinRatio * currentElementWidth;
            const currentMusicXMax = musicHotspot.xMaxRatio * currentElementWidth;
            const currentMusicYMin = musicHotspot.yMinRatio * currentElementHeight;
            const currentMusicYMax = musicHotspot.yMaxRatio * currentElementHeight;
            const isInsideMusic = (clickX >= currentMusicXMin && clickX <= currentMusicXMax && clickY >= currentMusicYMin && clickY <= currentMusicYMax);

            if (isInsideMusic) {
                isTransitioning = true;
                console.log("Music area clicked! Starting music animation.");

                // Ensure home video z-index is reset
                $animatedElement.removeClass('on-top');
                console.log("Home animated element '.on-top' class removed (if present)."); // Verify removal

                homeVideo.pause(); // Pause background video
                $body.addClass('music-info-hidden');
                $mapContainer.addClass('music-view-active'); // CSS hides home video

                // --- Prepare music video FORWARD ---
                musicVideo.onended = null; // Clear previous listener
                musicVideo.pause(); // Explicitly pause first
                musicVideo.currentTime = 0; // Reset time to beginning
                $musicVideoElement.removeClass('hide'); // Make video element visible
                console.log("Forward music video reset to 0 and revealed.");
                // --- End preparation ---

                // --- Use a tiny timeout before playing ---
                setTimeout(() => {
                    // Double-check we are still supposed to be playing
                    if (isTransitioning && $mapContainer.hasClass('music-view-active')) {
                        console.log("Timeout(0) fired: Playing forward music video.");
                        musicVideo.muted = false; // Ensure not muted
                        musicVideo.loop = false;
                        musicVideo.play().then(() => {
                            console.log("Music video playing forward initiated.");
                        }).catch(error => {
                            console.error("Error playing forward music video:", error);
                            isTransitioning = false; // Reset state on error
                            resetToDefaultView('music', true); // Force reset if play fails
                        });
                    } else {
                         console.log("Timeout(0) skipped: State changed before play could start.");
                         // Optional: Add cleanup here if needed if state changed rapidly
                    }
                }, 0); // 0ms timeout yields execution
                // --- End timeout ---

                // Set up listener for when music video FINISHES playing forward
                musicVideo.onended = function () {
                    console.log("Forward music animation finished.");
                    musicVideo.onended = null;
                    // Ensure home video z-index is still reset before showing iframe
                    $animatedElement.removeClass('on-top');
                    $musicFrameContainer.addClass('iframe-visible'); // Show iframe
                    isTransitioning = false; // End transition state
                };

                return; // Action handled
            }

            // 3. Clicked outside defined hotspots
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

                // Pause, reset time, and HIDE forward video (still good to hide this one)
                musicVideo.pause();
                musicVideo.currentTime = 0;
                $musicVideoElement.addClass('hide');
                console.log("Forward music video paused, reset, hidden.");

                // Ensure home video is NOT on top before reverse starts
                $animatedElement.removeClass('on-top');
                // Ensure home element itself is visible initially for reverse video to play 'under' it
                // (it might be hidden by gif-animate-forward if coming from contact quickly?)
                // Let's ensure it's potentially visible but just not on top yet.
                // The .music-view-active class on container should hide it via CSS anyway.


                // Prepare and play the REVERSE video (z-index 6)
                console.log("Playing reverse music video at 1.25x speed.");
                musicVideoReverse.onended = null;
                $musicVideoReverseElement.removeClass('hide'); // Show reverse video
                musicVideoReverse.currentTime = 0;
                musicVideoReverse.muted = false;
                musicVideoReverse.playbackRate = 2;

                musicVideoReverse.play().then(() => {
                    // --- MODIFIED: Listener for when reverse video finishes ---
                    musicVideoReverse.onended = function() {
                        console.log("Reverse music video finished.");
                        musicVideoReverse.onended = null;
                        musicVideoReverse.playbackRate = 1.0;

                        // Pause and reset reverse video state
                        musicVideoReverse.pause();
                        musicVideoReverse.currentTime = 0;

                        
                        // Ensure home video element is visible and BRING TO FRONT
                        $animatedElement.removeClass('hide gif-animate-forward'); // Make sure element is displayed
                        $animatedElement.addClass('on-top'); // *** ADD CLASS to increase z-index ***

                        $musicVideoReverseElement.addClass('hide');

                        performCommonResetTasks(); // Cleanup classes & play home video
                        isTransitioning = false; // End transition
                    };
                }).catch(error => {
                     console.error("Error playing reverse music video:", error);
                     musicVideoReverse.playbackRate = 1.0;
                     // Don't hide on error either, just reset state and try to show home
                     musicVideoReverse.pause();
                     musicVideoReverse.currentTime = 0;
                     $animatedElement.removeClass('hide gif-animate-forward');
                     $animatedElement.addClass('on-top'); // Bring home to top even on error
                     performCommonResetTasks();
                     isTransitioning = false;
                });

            } else if (source === 'contact') {
                 // Resetting from Contact View
                 $mapContainer.removeClass('contact-view-active');
                 $animatedElement.removeClass('gif-animate-forward'); // Stop animation class

                 // Ensure home video is visible and definitely NOT on top
                 $animatedElement.removeClass('hide');
                 $animatedElement.removeClass('on-top'); // *** Ensure z-index is reset ***

                 performCommonResetTasks();
                 // Set transitioning false - contact animation might have CSS duration
                 // Let's assume it's quick for now
                 isTransitioning = false;


            } else {
                 // Fallback
                 console.warn("Reset called with unknown source or state:", source);
                 // Ensure home video is visible and not on top in fallback
                 $animatedElement.removeClass('hide gif-animate-forward');
                 $animatedElement.removeClass('on-top');
                 performCommonResetTasks();
                 isTransitioning = false;
            }
        } // End resetToDefaultView

        // --- MODIFIED: Helper function for common reset tasks ---
        function performCommonResetTasks() {
            console.log("Performing common reset tasks (Layering Approach)...");

            // Pause/Reset transition videos state
            musicVideo.pause();
            musicVideo.currentTime = 0;
            $musicVideoElement.addClass('hide'); // Keep ensuring forward is hidden

            if (musicVideoReverse) {
                 musicVideoReverse.pause();
                 musicVideoReverse.currentTime = 0;
                 // *** NO LONGER HIDING reverse video here ***
                 // $musicVideoReverseElement.addClass('hide');
            }

            // Remove general state classes from containers/body
            $mapContainer.removeClass('contact-view-active music-view-active');
            $body.removeClass('music-info-hidden');
            $musicFrameContainer.removeClass('iframe-visible');

            // Restart home video (which should now be on top)
            if (!$mapContainer.hasClass('contact-view-active') && !$mapContainer.hasClass('music-view-active')) {
                 console.log("Restarting home video immediately.");
                 homeVideo.currentTime = 0;
                 homeVideo.loop = true;
                 homeVideo.muted = true;
                 homeVideo.play().catch(error => console.error("Error restarting home video:", error));
            } else {
                console.log("Home video restart skipped due to active state.");
            }
        } // End performCommonResetTasks

         $backButton.on('click', function() { resetToDefaultView('contact'); });
         $musicBackButton.on('click', function() { resetToDefaultView('music'); });


    } else {
        console.error("Essential elements missing. Full functionality disabled.");
    }


}); // End Document Ready

console.log("Script end");
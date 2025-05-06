// script.js - Combined Logic (Including Merch & Updated Music Animation)
// Last updated: 2025-05-05 (Based on conversation)

$(document).ready(function () {
    // --- Cache jQuery Objects ---
    const $body = $("body");
    const $mapContainer = $(".map-container");
    const $map = $("#map");
    const $animatedElement = $("#home-animated"); // Main looping video
    const $contactInfo = $("#contact-info");
    const $backButton = $("#back-button"); // Contact back button
  
    const $musicVideoElement = $("#music-video"); // Music forward animation
    const $musicVideoReverseElement = $("#music-video-reverse"); // Music reverse animation
    const $musicFrameContainer = $("#music-iframe-container"); // Inner container for iframe/button
    const $musicPlayerWrapper = $("#music-player-wrapper"); // The outer wrapper for visibility/clipping
    const $musicIframe = $("#music-iframe");
    const $musicBackButton = $("#music-back-button"); // Music back button
  
    // Merch Elements
    const $merchVideoElement = $("#merch-video"); // Merch forward animation
    const $merchVideoReverseElement = $("#merch-video-reverse"); // Merch reverse animation
    const $merchContentContainer = $("#merch-content-container"); // Merch widget container
    const $merchBackButton = $("#merch-back-button"); // Merch back button
  
    const originalWidth = 957;
    const originalHeight = 879;
  
    const hotspots = [
      { name: "music", overlaySelector: "#music-hover-overlay", xMinRatio: 40 / originalWidth, xMaxRatio: 310 / originalWidth, yMinRatio: 340 / originalHeight, yMaxRatio: 500 / originalHeight },
      { name: "merch", overlaySelector: "#merch-hover-overlay", xMinRatio: 520 / originalWidth, xMaxRatio: 770 / originalWidth, yMinRatio: 85 / originalHeight, yMaxRatio: 245 / originalHeight },
      { name: "contact", overlaySelector: "#contact-hover-overlay", xMinRatio: 500 / originalWidth, xMaxRatio: 820 / originalWidth, yMinRatio: 550 / originalHeight, yMaxRatio: 745 / originalHeight },
    ];
    const contactHotspot = hotspots.find((spot) => spot.name === "contact");
    const musicHotspot = hotspots.find((spot) => spot.name === "music");
    const merchHotspot = hotspots.find((spot) => spot.name === "merch");
  
    const $overlays = {};
    let allElementsFound = true;
  
    hotspots.forEach((spot) => {
      $overlays[spot.overlaySelector] = $(spot.overlaySelector);
      if ($overlays[spot.overlaySelector].length === 0) allElementsFound = false;
    });
  
    // Check other essential elements
    if ($body.length === 0) allElementsFound = false;
    if ($mapContainer.length === 0) allElementsFound = false;
    if ($map.length === 0) allElementsFound = false; // Added map check for completeness if used explicitly
    if ($animatedElement.length === 0) allElementsFound = false;
    if ($contactInfo.length === 0) allElementsFound = false;
    if ($backButton.length === 0) allElementsFound = false;
    if ($musicVideoElement.length === 0) allElementsFound = false;
    if ($musicVideoReverseElement.length === 0) allElementsFound = false;
    if ($musicFrameContainer.length === 0) allElementsFound = false;
    if ($musicPlayerWrapper.length === 0) allElementsFound = false;
    if ($musicIframe.length === 0) allElementsFound = false;
    if ($musicBackButton.length === 0) allElementsFound = false;
    if ($merchVideoElement.length === 0) allElementsFound = false;
    if ($merchVideoReverseElement.length === 0) allElementsFound = false;
    if ($merchContentContainer.length === 0) allElementsFound = false;
    if ($merchBackButton.length === 0) allElementsFound = false;
    if (!contactHotspot || !musicHotspot || !merchHotspot) allElementsFound = false;
  
    if (allElementsFound) {
      const homeVideo = $animatedElement[0];
      const musicVideo = $musicVideoElement[0];
      const musicVideoReverse = $musicVideoReverseElement[0];
      const merchVideo = $merchVideoElement[0];
      const merchVideoReverse = $merchVideoReverseElement[0];
  
      let isTransitioning = false;
  
      // --- Video Helper Functions ---
      function resetAndHideVideo(videoInstance, $videoElement) {
        if (videoInstance) {
          videoInstance.onended = null;
          videoInstance.pause();
          videoInstance.currentTime = 0;
        }
        if ($videoElement && $videoElement.length) {
          $videoElement.addClass("hide");
        }
      }
  
      function setupAndPlayVideo(videoInstance, $videoElement, { muted = false, loop = false, playbackRate = 1, onendedCallback = null, onErrorCallback = null }) {
        if (!videoInstance || !$videoElement || !$videoElement.length) {
          if (onErrorCallback) onErrorCallback(new Error("Video instance or element missing"));
          return;
        }
  
        videoInstance.onended = null;
        videoInstance.pause();
        videoInstance.currentTime = 0;
        $videoElement.removeClass("hide");
  
        videoInstance.muted = muted;
        videoInstance.loop = loop;
        videoInstance.playbackRate = playbackRate;
  
        if (onendedCallback) videoInstance.onended = onendedCallback;
  
        setTimeout(() => { // Ensure DOM updates apply before play
          videoInstance.play().catch((error) => {
            if (onErrorCallback) {
              onErrorCallback(error);
            } else {
              isTransitioning = false; // Generic fallback
            }
          });
        }, 0);
      }
  
      // --- Hover Effect Logic ---
      $animatedElement.on("mousemove", function (event) {
        if (isTransitioning || $mapContainer.is(".contact-view-active, .music-view-active, .merch-view-active")) {
          hotspots.forEach((spot) => $overlays[spot.overlaySelector].hide());
          return;
        }
  
        const currentElementWidth = $animatedElement.width();
        const currentElementHeight = $animatedElement.height();
        if (currentElementWidth === 0 || currentElementHeight === 0) return;
  
        const elementOffset = $animatedElement.offset();
        const mouseX = event.pageX - elementOffset.left;
        const mouseY = event.pageY - elementOffset.top;
  
        let activeOverlaySelector = null;
        hotspots.forEach((spot) => {
          const isInside = mouseX >= spot.xMinRatio * currentElementWidth && mouseX <= spot.xMaxRatio * currentElementWidth &&
                           mouseY >= spot.yMinRatio * currentElementHeight && mouseY <= spot.yMaxRatio * currentElementHeight;
          if (isInside) activeOverlaySelector = spot.overlaySelector;
        });
  
        hotspots.forEach((spot) => $overlays[spot.overlaySelector].toggle(spot.overlaySelector === activeOverlaySelector));
      });
  
      $animatedElement.on("mouseleave", function () {
        if (isTransitioning || $mapContainer.is(".contact-view-active, .music-view-active, .merch-view-active")) return;
        hotspots.forEach((spot) => $overlays[spot.overlaySelector].hide());
      });
  
      // --- Click Logic ---
      $animatedElement.on("click", function (event) {
        if (isTransitioning || $mapContainer.is(".contact-view-active, .music-view-active, .merch-view-active")) return;
  
        const currentElementWidth = $animatedElement.width();
        const currentElementHeight = $animatedElement.height();
        if (currentElementWidth === 0 || currentElementHeight === 0) return;
  
        const elementOffset = $animatedElement.offset();
        const clickX = event.pageX - elementOffset.left;
        const clickY = event.pageY - elementOffset.top;
  
        // Check Contact Click
        if (clickX >= contactHotspot.xMinRatio * currentElementWidth && clickX <= contactHotspot.xMaxRatio * currentElementWidth &&
            clickY >= contactHotspot.yMinRatio * currentElementHeight && clickY <= contactHotspot.yMaxRatio * currentElementHeight) {
          isTransitioning = true;
          hotspots.forEach((spot) => $overlays[spot.overlaySelector].hide());
          $mapContainer.addClass("contact-view-active");
          $animatedElement.addClass("gif-animate-forward");
          setTimeout(() => { isTransitioning = false; }, 500); // Match CSS animation
          return;
        }
  
        // Check Music Click
        if (clickX >= musicHotspot.xMinRatio * currentElementWidth && clickX <= musicHotspot.xMaxRatio * currentElementWidth &&
            clickY >= musicHotspot.yMinRatio * currentElementHeight && clickY <= musicHotspot.yMaxRatio * currentElementHeight) {
          isTransitioning = true;
          hotspots.forEach((spot) => $overlays[spot.overlaySelector].hide());
          $animatedElement.removeClass("on-top");
          if (homeVideo) homeVideo.pause();
          $body.addClass("music-info-hidden");
          $mapContainer.addClass("music-view-active");
  
          setupAndPlayVideo(musicVideo, $musicVideoElement, {
            muted: false, loop: false, playbackRate: 1.5,
            onendedCallback: () => {
              if ($mapContainer.hasClass("music-view-active")) {
                $animatedElement.removeClass("on-top");
                $musicPlayerWrapper.addClass("player-visible");
              }
              isTransitioning = false;
            },
            onErrorCallback: () => {
              isTransitioning = false;
              resetToDefaultView("music", true);
            }
          });
          return;
        }
  
        // Check Merch Click
        if (clickX >= merchHotspot.xMinRatio * currentElementWidth && clickX <= merchHotspot.xMaxRatio * currentElementWidth &&
            clickY >= merchHotspot.yMinRatio * currentElementHeight && clickY <= merchHotspot.yMaxRatio * currentElementHeight) {
          isTransitioning = true;
          hotspots.forEach((spot) => $overlays[spot.overlaySelector].hide());
          $animatedElement.removeClass("on-top");
          if (homeVideo) homeVideo.pause();
          $body.addClass("merch-info-hidden");
          $mapContainer.addClass("merch-view-active");
  
          setupAndPlayVideo(merchVideo, $merchVideoElement, {
            muted: false, loop: false, playbackRate: 1.5,
            onendedCallback: () => {
              if ($mapContainer.hasClass("merch-view-active")) {
                $animatedElement.removeClass("on-top");
                $merchContentContainer.addClass("merch-visible on-top");
                $merchVideoElement.addClass('hide'); // Hide forward merch video after it plays
              }
              isTransitioning = false;
            },
            onErrorCallback: () => {
              isTransitioning = false;
              resetToDefaultView("merch", true);
            }
          });
          return;
        }
      });
  
      // --- Unified Reset Function ---
      function resetToDefaultView(source, forceReset = false) {
        if (isTransitioning && !forceReset) return;
        isTransitioning = true;
  
        if (source === "music") {
          $musicPlayerWrapper.removeClass("player-visible").addClass("keep-visible-during-slide");
          const slideDownDurationMs = 600; // Match CSS
  
          setTimeout(() => {
            $musicPlayerWrapper.removeClass("keep-visible-during-slide");
            resetAndHideVideo(musicVideo, $musicVideoElement);
            $animatedElement.removeClass("on-top hide gif-animate-forward");
  
            setupAndPlayVideo(musicVideoReverse, $musicVideoReverseElement, {
              muted: false, loop: false, playbackRate: 2,
              onendedCallback: () => {
                resetAndHideVideo(musicVideoReverse, $musicVideoReverseElement);
                if(musicVideoReverse) musicVideoReverse.playbackRate = 1.0; // Reset playback rate
                $animatedElement.addClass("on-top");
                performCommonResetTasks();
                isTransitioning = false;
              },
              onErrorCallback: () => {
                $musicPlayerWrapper.removeClass("keep-visible-during-slide");
                resetAndHideVideo(musicVideoReverse, $musicVideoReverseElement);
                if(musicVideoReverse) musicVideoReverse.playbackRate = 1.0;
                $animatedElement.addClass("on-top");
                performCommonResetTasks();
                isTransitioning = false;
              }
            });
          }, slideDownDurationMs);
  
        } else if (source === "contact") {
          $animatedElement.removeClass("gif-animate-forward hide on-top");
          performCommonResetTasks();
          isTransitioning = false;
  
        } else if (source === "merch") {
          resetAndHideVideo(merchVideo, $merchVideoElement);
          $animatedElement.removeClass("on-top hide gif-animate-forward");
          $merchContentContainer.removeClass('on-top'); // Ensure this is removed before reverse plays
  
          setupAndPlayVideo(merchVideoReverse, $merchVideoReverseElement, {
            muted: false, loop: false, playbackRate: 2,
            onendedCallback: () => {
              $merchContentContainer.removeClass("merch-visible on-top");
              resetAndHideVideo(merchVideoReverse, $merchVideoReverseElement);
              $animatedElement.addClass("on-top");
              performCommonResetTasks();
              isTransitioning = false;
            },
            onErrorCallback: () => {
              $merchContentContainer.removeClass("merch-visible on-top");
              if ($map && $map.length) $map.removeClass('hide'); // From original error path
              resetAndHideVideo(merchVideoReverse, $merchVideoReverseElement);
              $animatedElement.addClass("on-top");
              performCommonResetTasks();
              isTransitioning = false;
            }
          });
        } else { // Fallback
          $animatedElement.removeClass("hide gif-animate-forward on-top");
          performCommonResetTasks();
          isTransitioning = false;
        }
      }
  
      function performCommonResetTasks() {
        resetAndHideVideo(musicVideo, $musicVideoElement);
        resetAndHideVideo(musicVideoReverse, $musicVideoReverseElement);
        resetAndHideVideo(merchVideo, $merchVideoElement);
        resetAndHideVideo(merchVideoReverse, $merchVideoReverseElement);
  
        $mapContainer.removeClass("contact-view-active music-view-active merch-view-active");
        $body.removeClass("music-info-hidden merch-info-hidden");
        $musicPlayerWrapper.removeClass("player-visible keep-visible-during-slide");
        $merchContentContainer.removeClass("merch-visible on-top");
        $animatedElement.removeClass("hide gif-animate-forward"); // on-top is handled by specific reset logic
  
        if (homeVideo && !$mapContainer.is(".contact-view-active, .music-view-active, .merch-view-active")) {
          homeVideo.currentTime = 0;
          homeVideo.loop = true;
          homeVideo.muted = true;
          homeVideo.play().catch(() => { /* Silent error for streamlining */ });
        }
      }
  
      // --- Back Button Event Handlers ---
      $backButton.on("click", () => resetToDefaultView("contact"));
      $musicBackButton.on("click", () => resetToDefaultView("music"));
      $merchBackButton.on("click", () => resetToDefaultView("merch"));
  
    } // End if (allElementsFound)
  });
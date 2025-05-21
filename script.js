// script.js - Streamlined Combined Logic
// Last updated: 2025-05-05 (Based on conversation)

$(document).ready(function () {
  // --- Cache jQuery Objects & Perform Existence Checks ---
  const elementSelectors = {
    body: "body",
    mapContainer: ".map-container",
    map: "#map",
    animatedElement: "#home-animated",
    contactInfo: "#contact-info",
    backButton: "#back-button",
    musicVideoElement: "#music-video",
    musicVideoReverseElement: "#music-video-reverse",
    musicFrameContainer: "#music-iframe-container",
    musicPlayerWrapper: "#music-player-wrapper",
    musicIframe: "#music-iframe",
    musicBackButton: "#music-back-button",
    merchVideoElement: "#merch-video",
    merchVideoReverseElement: "#merch-video-reverse",
    merchContentContainer: "#merch-content-container",
    merchBackButton: "#merch-back-button",
  };

  const $elements = {};
  let allElementsFound = true;

  for (const key in elementSelectors) {
    $elements[key] = $(elementSelectors[key]);
    if ($elements[key].length === 0) {
      allElementsFound = false;
      console.warn(`Essential element missing: ${elementSelectors[key]}`);
    }
  }

  const originalWidth = 968;
  const originalHeight = 974;

  const hotspots = [
    {
      name: "music",
      overlaySelector: "#music-hover-overlay",
      xMinRatio: 40 / originalWidth,
      xMaxRatio: 310 / originalWidth,
      yMinRatio: 340 / originalHeight,
      yMaxRatio: 500 / originalHeight,
    },
    {
      name: "merch",
      overlaySelector: "#merch-hover-overlay",
      xMinRatio: 520 / originalWidth,
      xMaxRatio: 770 / originalWidth,
      yMinRatio: 85 / originalHeight,
      yMaxRatio: 245 / originalHeight,
    },
    {
      name: "contact",
      overlaySelector: "#contact-hover-overlay",
      xMinRatio: 500 / originalWidth,
      xMaxRatio: 820 / originalWidth,
      yMinRatio: 550 / originalHeight,
      yMaxRatio: 745 / originalHeight,
    },
  ];

  const $overlays = {};
  hotspots.forEach((spot) => {
    $overlays[spot.overlaySelector] = $(spot.overlaySelector);
    if ($overlays[spot.overlaySelector].length === 0) {
      allElementsFound = false;
      console.warn(`Hotspot overlay missing: ${spot.overlaySelector}`);
    }
  });

  const requiredHotspotNames = ["music", "merch", "contact"];
  const definedHotspotNames = hotspots.map(spot => spot.name);
  if (!requiredHotspotNames.every(name => definedHotspotNames.includes(name))) {
    allElementsFound = false;
    console.warn("One or more required hotspot configurations (music, merch, contact) are missing in the hotspots array.");
  }

  if (allElementsFound) {
    const homeVideo = $elements.animatedElement[0];
    const musicVideo = $elements.musicVideoElement[0];
    const musicVideoReverse = $elements.musicVideoReverseElement[0];
    const merchVideo = $elements.merchVideoElement[0];
    const merchVideoReverse = $elements.merchVideoReverseElement[0];

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

    function setupAndPlayVideo(
      videoInstance,
      $videoElement,
      {
        muted = false,
        loop = false,
        playbackRate = 1,
        onendedCallback = null,
        onErrorCallback = null,
      }
    ) {
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

      // setTimeout to ensure DOM updates apply before play, and catch play() promise
      setTimeout(() => {
        videoInstance.play().catch((error) => {
          if (onErrorCallback) {
            onErrorCallback(error);
          } else {
            console.error("Video play error:", error);
            isTransitioning = false; // Default error handling
          }
        });
      }, 0);
    }

    // --- Hotspot Detection Helper ---
    function getActiveHotspot(
      event,
      $element,
      hotspotsArray,
      intrinsicImgWidth,
      intrinsicImgHeight
    ) {
      const containerWidth = $element.width();
      const containerHeight = $element.height();

      if (containerWidth === 0 || containerHeight === 0) return null;

      const elementOffset = $element.offset();
      const mouseX_relative_to_container = event.pageX - elementOffset.left;
      const mouseY_relative_to_container = event.pageY - elementOffset.top;

      let effectiveImageWidth = containerWidth;
      let effectiveImageHeight = containerHeight;
      let mouseX_on_image = mouseX_relative_to_container;
      let mouseY_on_image = mouseY_relative_to_container;

      const isContainMode = window.innerWidth < 450;

      if (isContainMode) {
        const imageAspectRatio = intrinsicImgWidth / intrinsicImgHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imageAspectRatio > containerAspectRatio) {
          effectiveImageWidth = containerWidth;
          effectiveImageHeight = effectiveImageWidth / imageAspectRatio;
          offsetY = (containerHeight - effectiveImageHeight) / 2;
        } else {
          effectiveImageHeight = containerHeight;
          effectiveImageWidth = effectiveImageHeight * imageAspectRatio;
          offsetX = (containerWidth - effectiveImageWidth) / 2;
        }

        mouseX_on_image = mouseX_relative_to_container - offsetX;
        mouseY_on_image = mouseY_relative_to_container - offsetY;

        if (
          mouseX_on_image < 0 || mouseX_on_image > effectiveImageWidth ||
          mouseY_on_image < 0 || mouseY_on_image > effectiveImageHeight
        ) {
          return null;
        }
      }

      for (const spot of hotspotsArray) {
        if (
          mouseX_on_image >= spot.xMinRatio * effectiveImageWidth &&
          mouseX_on_image <= spot.xMaxRatio * effectiveImageWidth &&
          mouseY_on_image >= spot.yMinRatio * effectiveImageHeight &&
          mouseY_on_image <= spot.yMaxRatio * effectiveImageHeight
        ) {
          return spot;
        }
      }
      return null;
    }
    
    function isAnyViewActive() {
        return $elements.mapContainer.is(".contact-view-active, .music-view-active, .merch-view-active");
    }

    // --- Hover Effect Logic ---
    $elements.animatedElement.on("mousemove", function (event) {
      if (isTransitioning || isAnyViewActive()) {
        hotspots.forEach((spot) => $overlays[spot.overlaySelector]?.hide());
        if (!isAnyViewActive()) $elements.animatedElement.css("cursor", "default");
        return;
      }

      const activeHotspot = getActiveHotspot(event, $elements.animatedElement, hotspots, originalWidth, originalHeight);
      
      hotspots.forEach((spot) => {
        if ($overlays[spot.overlaySelector]) {
            const action = activeHotspot && activeHotspot.name === spot.name ? 'show' : 'hide';
            $overlays[spot.overlaySelector][action]();
        }
      });
      $elements.animatedElement.css("cursor", activeHotspot ? "pointer" : "default");
    });

    $elements.animatedElement.on("mouseleave", function () {
      if (isTransitioning || isAnyViewActive()) return;
      hotspots.forEach((spot) => $overlays[spot.overlaySelector]?.hide());
      $elements.animatedElement.css("cursor", "default");
    });

    // --- Click Logic ---
    $elements.animatedElement.on("click", function (event) {
      if (isTransitioning || isAnyViewActive()) return;

      const clickedHotspot = getActiveHotspot(event, $elements.animatedElement, hotspots, originalWidth, originalHeight);

      if (clickedHotspot) {
        isTransitioning = true;
        hotspots.forEach((spot) => $overlays[spot.overlaySelector]?.hide());

        if (clickedHotspot.name === "contact") {
          $elements.mapContainer.addClass("contact-view-active");
          $elements.animatedElement.addClass("gif-animate-forward");
          $elements.contactInfo.removeClass("hide");
          setTimeout(() => { isTransitioning = false; }, 500);
        } else if (clickedHotspot.name === "music") {
          $elements.animatedElement.removeClass("on-top");
          if (homeVideo) homeVideo.pause();
          $elements.body.addClass("music-info-hidden");
          $elements.mapContainer.addClass("music-view-active");

          setupAndPlayVideo(musicVideo, $elements.musicVideoElement, {
            muted: false, loop: false, playbackRate: 1.8,
            onendedCallback: () => {
              if ($elements.mapContainer.hasClass("music-view-active")) {
                $elements.musicPlayerWrapper.addClass("player-visible");
              }
              isTransitioning = false;
            },
            onErrorCallback: (err) => {
              console.error("Music forward video error:", err);
              isTransitioning = false;
              resetToDefaultView("music", true);
            },
          });
        } else if (clickedHotspot.name === "merch") {
          $elements.animatedElement.removeClass("on-top");
          if (homeVideo) homeVideo.pause();
          $elements.body.addClass("merch-info-hidden");
          $elements.mapContainer.addClass("merch-view-active");
          $elements.merchContentContainer.removeClass("hide");

          setupAndPlayVideo(merchVideo, $elements.merchVideoElement, {
            muted: false, loop: false, playbackRate: 1.8,
            onendedCallback: () => {
              if ($elements.mapContainer.hasClass("merch-view-active")) {
                $elements.merchContentContainer.addClass("merch-visible");
                $elements.merchVideoElement.addClass("hide");
              }
              isTransitioning = false;
            },
            onErrorCallback: (err) => {
              console.error("Merch forward video error:", err);
              isTransitioning = false;
              resetToDefaultView("merch", true);
            },
          });
        } else {
          // Should not happen if hotspots array is well-defined
          isTransitioning = false; 
        }
      }
    });

    // --- Unified Reset Function ---
    function resetToDefaultView(source, forceReset = false) {
      if (isTransitioning && !forceReset) return;
      isTransitioning = true;

      const commonReverseVideoEndTasks = (reverseVideoInstance, $reverseVideoElement, specificCleanup) => {
        if (specificCleanup) specificCleanup();
        resetAndHideVideo(reverseVideoInstance, $reverseVideoElement);
        $elements.animatedElement.addClass("on-top");
        performCommonResetTasks();
        isTransitioning = false;
      };
      
      if (source === "music") {
        $elements.musicPlayerWrapper.removeClass("player-visible").addClass("keep-visible-during-slide");
        setTimeout(() => {
          $elements.musicPlayerWrapper.removeClass("keep-visible-during-slide");
          resetAndHideVideo(musicVideo, $elements.musicVideoElement);
          $elements.animatedElement.removeClass("on-top hide gif-animate-forward");

          setupAndPlayVideo(musicVideoReverse, $elements.musicVideoReverseElement, {
            muted: false, loop: false, playbackRate: 2.5,
            onendedCallback: () => commonReverseVideoEndTasks(musicVideoReverse, $elements.musicVideoReverseElement, () => {
                if (musicVideoReverse) musicVideoReverse.playbackRate = 1.0;
            }),
            onErrorCallback: (err) => {
              console.error("Music reverse video error:", err);
              commonReverseVideoEndTasks(musicVideoReverse, $elements.musicVideoReverseElement, () => {
                if (musicVideoReverse) musicVideoReverse.playbackRate = 1.0;
                $elements.musicPlayerWrapper.removeClass("keep-visible-during-slide"); // Ensure cleanup
              });
            },
          });
        }, 400); // slideDownDurationMs
      } else if (source === "contact") {
        $elements.animatedElement.removeClass("gif-animate-forward hide on-top");
        performCommonResetTasks(); // Hides contactInfo among other things
        setTimeout(() => { isTransitioning = false;  $elements.contactInfo.addClass("hide"); }, 1500); // Delay for potential hide animation
        
      } else if (source === "merch") {
        resetAndHideVideo(merchVideo, $elements.merchVideoElement);
        $elements.animatedElement.removeClass("on-top hide gif-animate-forward");
        if (window.innerWidth < 450) $elements.merchContentContainer.addClass("hide");

        setupAndPlayVideo(merchVideoReverse, $elements.merchVideoReverseElement, {
          muted: false, loop: false, playbackRate: 2,
          onendedCallback: () => commonReverseVideoEndTasks(merchVideoReverse, $elements.merchVideoReverseElement, () => {
            $elements.merchContentContainer.removeClass("merch-visible on-top").addClass("hide");
          }),
          onErrorCallback: (err) => {
            console.error("Merch reverse video error:", err);
            commonReverseVideoEndTasks(merchVideoReverse, $elements.merchVideoReverseElement, () => {
              $elements.merchContentContainer.removeClass("merch-visible on-top").addClass("hide");
              if ($elements.map.length) $elements.map.removeClass("hide");
            });
          },
        });
      } else {
        performCommonResetTasks();
        isTransitioning = false;
      }
    }

    function performCommonResetTasks() {
      [musicVideo, musicVideoReverse, merchVideo, merchVideoReverse].forEach((vid, index) => {
        const $el = [$elements.musicVideoElement, $elements.musicVideoReverseElement, $elements.merchVideoElement, $elements.merchVideoReverseElement][index];
        resetAndHideVideo(vid, $el);
      });

      $elements.mapContainer.removeClass("contact-view-active music-view-active merch-view-active");
      $elements.body.removeClass("music-info-hidden merch-info-hidden");
      $elements.musicPlayerWrapper.removeClass("player-visible keep-visible-during-slide");
      $elements.merchContentContainer.removeClass("merch-visible on-top").addClass("hide");

      $elements.animatedElement.removeClass("hide gif-animate-forward");

      if (homeVideo && !isAnyViewActive()) {
        $elements.animatedElement.addClass("on-top");
        homeVideo.currentTime = 0;
        homeVideo.loop = true;
        homeVideo.muted = true;
        homeVideo.play().catch((e) => console.error("Error playing home video:", e));
      } else if (homeVideo) {
        homeVideo.pause(); // Ensure home video is paused if a view is still active
      }
    }

    // --- Back Button Event Handlers ---
    $elements.backButton.on("click", () => resetToDefaultView("contact"));
    $elements.musicBackButton.on("click", () => resetToDefaultView("music"));
    $elements.merchBackButton.on("click", () => resetToDefaultView("merch"));

  } else {
    console.error("Initialization failed: Essential elements or hotspot configurations missing. Interactivity disabled.");
    // Consider disabling UI or showing a message to the user
  }
});
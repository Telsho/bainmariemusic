/**
 * jQuery pan
 * Allows moving elements by dragging
 * https://github.com/ayamflow/jquery.pan
 */

(function($) {
    $.fn.pan = function(options) {
        var settings = $.extend({
            'kineticDamping': 0.25,
            'initialPosition': {
                'x': 0,
                'y': 0
            },
            'allowClickEvent': true
        }, options);

        return this.each(function() {
            var mouseDown = false,
                $this = $(this),
                interval,
                startCoords = {},
                mouseCoords = {},
                lastCoords = {},
                contentCoords = settings.initialPosition,
                allowClick = true;

            // Set initial position from options if provided
            if (settings.initialPosition.x !== 0 || settings.initialPosition.y !== 0) {
                $this.css({
                    'left': settings.initialPosition.x + 'px',
                    'top': settings.initialPosition.y + 'px'
                });
            }

            // Mouse events
            $this.on('mousedown touchstart', function(e) {
                if ($(e.target).is('a') || $(e.target).parent().is('a')) {
                    allowClick = true;
                    return true;
                }

                if ($this.parent().hasClass('pan-off')) {
                    return;
                }

                mouseDown = true;
                allowClick = true;

                // Store mouse/touch coordinates
                if (e.type === 'mousedown') {
                    startCoords.x = e.pageX;
                    startCoords.y = e.pageY;
                } else {
                    startCoords.x = e.originalEvent.touches[0].pageX;
                    startCoords.y = e.originalEvent.touches[0].pageY;
                }

                lastCoords.x = startCoords.x;
                lastCoords.y = startCoords.y;

                // Prevent default to avoid text selection
                e.preventDefault();
                return false;
            });

            $(document).on('mousemove touchmove', function(e) {
                if (mouseDown) {
                    // Store mouse/touch coordinates
                    if (e.type === 'mousemove') {
                        mouseCoords.x = e.pageX;
                        mouseCoords.y = e.pageY;
                    } else {
                        mouseCoords.x = e.originalEvent.touches[0].pageX;
                        mouseCoords.y = e.originalEvent.touches[0].pageY;
                    }

                    // Detect if drag was significant to prevent click event
                    if (settings.allowClickEvent === true) {
                        if (Math.abs(startCoords.x - mouseCoords.x) > 5 || Math.abs(startCoords.y - mouseCoords.y) > 5) {
                            allowClick = false;
                        }
                    }

                    // Calculate the new element position
                    contentCoords.x += mouseCoords.x - lastCoords.x;
                    contentCoords.y += mouseCoords.y - lastCoords.y;

                    // Move the element
                    $this.css({
                        'left': contentCoords.x + 'px',
                        'top': contentCoords.y + 'px'
                    });

                    // Store current coordinates for next move
                    lastCoords.x = mouseCoords.x;
                    lastCoords.y = mouseCoords.y;

                    e.preventDefault();
                    return false;
                }
            });

            $(document).on('mouseup touchend', function(e) {
                if (mouseDown) {
                    mouseDown = false;

                    // If it's a click and not a drag then allow the click event
                    if (settings.allowClickEvent === true) {
                        if ($(e.target).is('a') || $(e.target).parent().is('a')) {
                            if (allowClick) {
                                // It's a click, allow the event
                                return true;
                            } else {
                                // It's a drag, prevent the event
                                e.preventDefault();
                                return false;
                            }
                        }
                    }
                }
            });

            // Prevent click on links if it was a drag
            $this.on('click', 'a', function(e) {
                if (!allowClick) {
                    e.preventDefault();
                    return false;
                }
                return true;
            });
        });
    };
})(jQuery);
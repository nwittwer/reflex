// Returns the current canvasMinSize
var canvasMinSize = {}
canvasMinSize.x = app.minScaleX;
canvasMinSize.y = app.minScaleY;
canvasMinSize.update = function () {
    app.minScaleX = $(window).width() / artboards.innerWidth();
    app.minScaleY = $(window).height() / artboards.innerHeight();
    canvasMinSize.x = $(window).width() / artboards.innerWidth();
    canvasMinSize.y = $(window).height() / artboards.innerHeight();
};

// Window Resize Event
$(window).on('resize', function () {
    canvasMinSize.update();
    console.log(app.minScaleX, app.minScaleY, canvasMinSize.x, canvasMinSize.y);
});

// Fit contents to screen width/height
$("#canvas-controls__fit-to-screen").on('click', function () {
    canvasMinSize.update();
    canvas.panzoom("setTransform", 'scale(' + Math.min(canvasMinSize.x, canvasMinSize.y) + ')');
    updateScale("fromCanvas")
    console.log(app.minScaleX, app.minScaleY, "scale:", canvasMinSize.x, canvasMinSize.y);
});

// (function () {

// ===============================
// Mousewheel/Trackpad Zooming
// ===============================

if (!canvas.panzoom("isDisabled")) {
    // Allow mousewheel/trackpad zooming & dragging
    canvas.parent().on('mousewheel.focal', function (e) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        canvas.panzoom('zoom', zoomOut, {
            animate: false,
            focal: e
        });
    });

    // Update the zoom percentage on zoom
    canvas.on('panzoomzoom', function (e, panzoom, scale, opts) {
        updateScale('fromCanvas');
    });
}

canvas.on('panzoompan', function () {
    // Accept all events from parent
    artboards.css("pointer-events", "all");
    artboards.css("cursor", "move");
    // Override all other elements
    $('body').css("cursor", "move");
    // Disable pointer events on other elements
    $("webview").css("pointer-events", "none");
    artboards.css("pointer-events", "none");

    canvas.on('panzoomend', function (e, panzoom, matrix, changed) {
        // Accept all events from parent
        artboards.css("pointer-events", "");
        artboards.css("cursor", "");
        // Override all other elements
        $('body').css("cursor", "");
        // Disable pointer events on other elements
        $("webview").css("pointer-events", "");
        artboards.css("pointer-events", "");
    });
});

// ===============================
// Zoom Scale Percentage
// ===============================

// Update zoom percentage on load
// TODO: attach to init


// Create data-binding objects
var data = {
    scale: '100%'
}
var bindings = $.bindings(data);

// @TODO: Add to init
updateScale('fromCanvas');

// Watch the input for changes
$(canvasControls.scale).on('keypress', function (e) {
    if (e.which == 13) {
        updateScale('fromInput');
    }
});

function updateScale(arg) {
    var input_val = bindings.scale.replace(/\D/g, '') + "%";
    var panzoom_val = Math.round(canvas.panzoom("getMatrix")[0] * 4) / 4 * 100 + "%";
    console.log(arg, input_val, panzoom_val);

    if (arg != undefined) {
        if (arg === "fromCanvas") {
            // Default: just update the scale's value
            $(canvasControls.scale).val(panzoom_val);
        } else if (arg === "fromInput") {
            // Update the canvas based on the input
            // Also update the canvas' value
            var new_decimal = parseFloat(input_val) / 100;
            var new_decimal_asPercent = (new_decimal * 100) + "%";
            canvas.panzoom("zoom", new_decimal, {
                // silent: true
            });
            input_val = bindings.scale.replace(/\D/g, '') + "%";
        }
    } else {

    }
}

// })();
// Global Namespace
// Additional functions can use `boomerang.fn()` format
var app = {};

// The app is written for the web by default
// So you can add a !isWeb flag to add native (Mac/Windows) features
// Checks by seeing if nw (NW.js) is defined
var nw = nw || null;
if (nw == null) {
    // App is on web
    app.platform = "web";
} else {
    // App is using NW.js (Mac/Windows app)
    app.platform = "native";
}

// Check if this a dev or production environment
let currentURL = new URL(window.location.href);
if (currentURL.hostname.includes("localhost")) {
    console.log("Environment: development");
    app.environment = "dev";
} else {
    console.log("Environment: production");
    app.environment = "production";
}

// if (  )

app.events = {
    // If an artboard is selected
    isOnArtboard: false,
    // If the canvas is zooming/panning
    isChangingCanvas: false,
    // If resizing an artboard (resize.js)
    isResizingArtboard: false
};

// Artboards
var artboards = $("#artboards");
var artboard = $(".artboard");
var artboardInnerFrame = $("iframe");

// Set initial scale
app.minScaleX = $(window).width() / artboards.innerWidth();
app.minScaleY = $(window).height() / artboards.innerHeight();

// Canvas
var canvas = artboards.panzoom({
    increment: 0.5,
    maxScale: 5,
    minScale: 0.05,
    startTransform: 'scale(' + Math.min(app.minScaleX, app.minScaleY) + ')'
}).panzoom('zoom', true);

// Controls
var canvasControls = {
    container: $('#toolbar__canvas-controls'),
    scale: $("#canvas-controls__scale"),
    orientation: $("#canvas-controls__orientation"),
}

// ==================================================
// Artboards
// ==================================================
// Resize Handles
var resize_handle__right = $(".handle__right");
var resize_handle__bottom = $(".handle__bottom");

// Watch for when an artboard is being resized
if (app.events.isResizingArtboard == true) {
    canvas.panzoom("isDisabled")
}

// var mouse_position; // helps locate items to delete in context menu
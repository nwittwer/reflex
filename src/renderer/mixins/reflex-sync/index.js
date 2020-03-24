/**
 * NOTE: This all happens in the Webview context
 * Communicate with renderer process (WebPage.vue) via ipcRenderer.sendToHost()
 */
const { ipcRenderer } = require('electron')
const helpers = require('./lib/helpers')
const setDOMEffect = require("./lib/effects");
const eventTypes = require("./lib/eventTypes")


let state = {
    isOrigin: false
}

function getState() {
    return state
}

// Add listener for each event type
for (let i in eventTypes) {
    console.log('Added listener:', eventTypes[i])
    document.addEventListener(eventTypes[i], responder, false);
}

let responderTimer
function responder(event) {
    event = event || window.event;

    const state = getState()

    if (!state.isOrigin) {
        console.log('is not origin!');
    }

    // Unbind event temporarily
    document.removeEventListener(event.type, responder)

    // Serialize the event target
    // var el = document.createElement("p");
    // el.appendChild(document.createTextNode("Test"));
    // console.log(event.target.outerHTML); // <p>Test</p>

    // var parser = new DOMParser();
    // var doc = parser.parseFromString(event.target, "text/html");
    // console.log(doc);

    // console.log(document.querySelector(event.target));

    const getEventTarget = () => {
        console.log(window.event);
        console.log(event.target.outerHTML);

        const nodes = document.getElementsByTagName(event.target.tagName)
        const index = Array.prototype.indexOf.call(nodes, event.target)
        const eventElement = nodes[index]

        console.log(eventElement);

        if (eventElement) {
            return {
                element: eventElement.outerHTML,
                elementTagName: eventElement.tagName,
                index: index
            }
        } else {
            return null
        }
    }

    const eventObj = {
        type: event.type,
        target: getEventTarget() // Only set for clicks
    }

    // Send event to event bus
    ipcRenderer.sendToHost("REFLEX_SYNC", {
        event: eventObj,
        origin: {
            scrollHeight: document.documentElement.scrollHeight,
            offsetHeight: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            viewportHeight: helpers.documentHeight(),
            scrollOffset: {
                top: window.scrollY,
                left: window.scrollX
            }
        },
    });

    // Re-bind the event
    if (typeof (responderTimer) !== 'undefind')
        clearTimeout(responderTimer);

    responderTimer = setTimeout(function () {
        document.addEventListener(event.type, responder)
    }, 10)
}

// Set DOM effects via the renderer
ipcRenderer.on('REFLEX_SYNC_setDOMEffect', (...args) => {
    setDOMEffect(...args)
})


ipcRenderer.on('REFLEX_SYNC_setState', (...localState) => {
    if (localState.isOrigin) {
        state.isOrigin = localState.isOrigin
    }
})











///////////////////////////////
///////////////////////////////
///////////////////////////////

/**
 * Collect and send back information from the document context
 */
document.addEventListener("DOMContentLoaded", dataCollector);

function dataCollector() {
    let data = {
        title: document.title,
        favicon: "https://www.google.com/s2/favicons?domain=" +
            window.location.href
    }

    ipcRenderer.once('requestData', () => {
        ipcRenderer.sendToHost('replyData', data)
        document.removeEventListener('DOMContentLoaded', dataCollector)
    })
}

///////////////////////////////
///////////////////////////////
///////////////////////////////

/**
 * Cleanup before page unloads
 */
window.addEventListener('beforeunload', unload);

function unload(e) {
    // Cancel the event
    e.preventDefault();

    // Remove IPC event listener
    ipcRenderer.removeAllListeners('requestData')

    // Remove listener
    document.removeEventListener('DOMContentLoaded', dataCollector)

    // Remove eventlistener
    window.removeEventListener('beforeunload', unload)

    // Alert the parent!
    ipcRenderer.sendToHost('unload', 'Unload complete')

    // Chrome requires returnValue to be set
    // e.returnValue = '';

    // the absence of a returnValue property on the event will guarantee the browser unload happens
    delete e['returnValue'];
}
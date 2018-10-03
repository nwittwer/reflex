app.settings = {
    init: function () {
        // Start the artboard sizes
        app.settings.artboardSizes.init();
    },

    firstLoad: function () {}
}

//
// Custom menubar
//
// Create menu container	
var Menu = new nw.Menu({	
    type: 'menubar'	
});	
//initialize default mac menu	
Menu.createMacBuiltin(nw.App.manifest.name);	
// Get the root menu from the default mac menu	
var rootMenu = Menu.items[0].submenu;	
// Append new item to root menu	
rootMenu.insert(	
    new nw.MenuItem({	
        label: 'Preferences',	
        click: function () {	
            toggleSettings();	
        }	
    }), 1 // <-- 0-index where you want to insert	
);	
// Append Menu to Window	
nw.Window.get().menu = Menu;

// Click function
function toggleSettings() {
    var $el = $("#settings");
    var settingsClass = "is-visible";

    if ($el.hasClass(settingsClass)) {
        $el.removeClass(settingsClass);
        // Unbind
        $("body").off('click', clickOutside);
    } else {
        $el.addClass(settingsClass);
        // Bind 
        $("body").on('click', clickOutside);
    }
}

function clickOutside(event) {
    if (!$(event.target).closest('.settings__inner').length && !$(event.target).is('.settings__inner')) {
        // $("body").find("#settings").removeClass("is-visible");
        toggleSettings();
        console.log('should remove');
    }
}
const $ = require('jquery');

let artboard = $('.artboard'); // TODO: Refactor this to a more re-usable place

export function updateDimensions($el, width, height) {

    // Updates the dimensions of a given artboard (via jQuery element)
    if (width || height) {
        var height_container = $el.closest(artboard).find('.artboard__height');
        var width_container = $el.closest(artboard).find('.artboard__width');

        if (typeof width !== undefined) {
            width = $el.closest(artboard).width();
            width_container.html(width + "px");
            // console.log(width);
        }

        if (typeof height !== undefined) {
            height = $el.closest(artboard).height();
            height_container.html(height + "px");
            // console.log(height);
        }
    } else {
        $.each($el, function () {
            var height_container = $(this).closest(artboard).find('.artboard__height');
            var width_container = $(this).closest(artboard).find('.artboard__width');

            if (typeof width !== undefined) {
                width = $(this).closest(artboard).width();
                width_container.html(width + "px");
                // console.log(width);
            }

            if (typeof height !== undefined) {
                height = $(this).closest(artboard).height();
                height_container.html(height + "px");
                // console.log(height);
            }

            // console.log($(this));

        });
    }
}

export function returnDimensions() {
    var obj = [];

    $.each($(".artboard"), function () {
        var width;
        var height;

        width = $(this).width();
        height = $(this).height();

        obj.push({
            width,
            height
        });
    });

    return obj;
}


// ////////////////////////////
// ////////////////////////////
// ////////////////////////////

// app.artboard.dimensions = {

//     init: function () {
//         this.firstLoad();
//     },

//     firstLoad: function () {
//         app.artboard.dimensions.update(artboard)
//     },

//     /**
//      * Function: Resize
//      * @param  {} $el
//      * @param  {} width
//      * @param  {} height
//      */
//     update: function ($el, width, height) {
//         if (width || height) {
//             var height_container = $el.closest(artboard).find('.artboard__height');
//             var width_container = $el.closest(artboard).find('.artboard__width');

//             if (typeof width !== undefined) {
//                 width = $el.closest(artboard).width();
//                 width_container.html(width + "px");
//                 // console.log(width);
//             }

//             if (typeof height !== undefined) {
//                 height = $el.closest(artboard).height();
//                 height_container.html(height + "px");
//                 // console.log(height);
//             }
//         } else {
//             $.each($el, function () {
//                 var height_container = $(this).closest(artboard).find('.artboard__height');
//                 var width_container = $(this).closest(artboard).find('.artboard__width');

//                 if (typeof width !== undefined) {
//                     width = $(this).closest(artboard).width();
//                     width_container.html(width + "px");
//                     // console.log(width);
//                 }

//                 if (typeof height !== undefined) {
//                     height = $(this).closest(artboard).height();
//                     height_container.html(height + "px");
//                     // console.log(height);
//                 }

//                 // console.log($(this));

//             });
//         }
//     },

//     return: function () {
//         var obj = [];

//         $.each($(".artboard"), function () {
//             var width;
//             var height;

//             width = $(this).width();
//             height = $(this).height();

//             obj.push({
//                 width,
//                 height
//             });
//         });

//         return obj;
//     }

// }
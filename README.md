# RespBreak

Handles breakpoints in responsive designs, using a pattern inspired by Ruby on Rails up()-down() DB Migrator pattern.

**Ultra light**: 831 bytes after minification, 440 bytes with gzip.

## Usage

For each state you want to represent (e.g. mobile, tablet, desktop) create an object with three methods:

* `ishere(width)` evaluates criteria and returns `true` if the browser window is in a particular state. This method is passed the window width as the `width` parameter. A typical condition is `width <= 976` for example.
* `up()` is called when the browser window moves "up" a state (e.g. from mobile to tablet). This function should do all the necessary work to change the document flow and make the changes you want.
* `down()` is called when the browser window moves "down" a state (e.g. from tablet to mobile). It should undo all the changes that `up()` did.

When you have all the state objects you desire, simply create a new `RespBreak` object: `new RespBreak(states, loaded_version)`. The `states` parameter is an array of your state objects. `loaded_version` is the array index of the state object you have currently loaded (e.g. if you pass `[state_mobile, state_desktop]` as `states`, and your HTML is served for mobile first, you pass `loaded_version=0`. If your HTML is served for desktop first, you pass `loaded_version=1`).

### Example

This example is for when HTML is served mobile first. The HTML document is structured for the mobile view. When the browser window size is increased beyond 976px wide, the `state_full.up()` function is called, and the function makes the necessary structural changes for the desktop website. When the window decreases, `state_full.down()` is called to undo the changes.

If the desktop HTML is served by default, you can simply change the second parameter of the RespBreak constructor to `1`, corresponding to that state object's position in the array `states`.

HTML:

    <div id="output">mobile</div>

Javascript:

    var state_mobile = {
        "ishere": function (width) {
            return (width <= 976);
        }
    };
    
    var state_full = {
        "ishere": function (width) {
            return (width > 976);
        },
        
        // up from mobile
        "up": function () {
            document.getElementById("output").innerHTML = "desktop";
        },
        
        // down to mobile
        "down": function () {
             document.getElementById("output").innerHTML = "mobile";
        }
    };
    
    new RespBreak([state_mobile, state_full], 0);
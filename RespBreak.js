/*! viewportSize | Author: Tyson Matanich, 2013 | License: MIT */
(function (window) {

	window.viewportSize = {};

	window.viewportSize.getHeight = function () {
		return getSize("Height");
	};

	window.viewportSize.getWidth = function () {
		return getSize("Width");
	};

	var getSize = function (Name) {
		var size;
		var name = Name.toLowerCase();
		var document = window.document;
		var documentElement = document.documentElement;
		if (window["inner" + Name] === undefined) {
			// IE6 & IE7 don't have window.innerWidth or innerHeight
			size = documentElement["client" + Name];
		}
		else if (window["inner" + Name] != documentElement["client" + Name]) {
			// WebKit doesn't include scrollbars while calculating viewport size so we have to get fancy

			// Insert markup to test if a media query will match document.doumentElement["client" + Name]
			var bodyElement = document.createElement("body");
			bodyElement.id = "vpw-test-b";
			bodyElement.style.cssText = "overflow:scroll";
			var divElement = document.createElement("div");
			divElement.id = "vpw-test-d";
			divElement.style.cssText = "position:absolute;top:-1000px";
			// Getting specific on the CSS selector so it won't get overridden easily
			divElement.innerHTML = "<style>@media(" + name + ":" + documentElement["client" + Name] + "px){body#vpw-test-b div#vpw-test-d{" + name + ":7px!important}}</style>";
			bodyElement.appendChild(divElement);
			documentElement.insertBefore(bodyElement, document.head);

			if (divElement["offset" + Name] == 7) {
				// Media query matches document.documentElement["client" + Name]
				size = documentElement["client" + Name];
			}
			else {
				// Media query didn't match, use window["inner" + Name]
				size = window["inner" + Name];
			}
			// Cleanup
			documentElement.removeChild(bodyElement);
		}
		else {
			// Default to use window["inner" + Name]
			size = window["inner" + Name];
		}
		return size;
	};

})(this);

/**
 *
 */
var RespBreak = (function (window, document, undefined) {
	/**
	 * Handles breakpoints in responsive designs, using a pattern inspired
	 * by Ruby on Rails up()-down() DB Migrator pattern.
	 *
	 * @constructor
	 * @param {Array} states Array of state objects
	 * @param {number} loaded_version Index of states parameter which is currently loaded (i.e. the default state of the HTML document).
	 * @version 1.0
	 */
	var RespBreak = function (states, loaded_version) {
		var resize_cb = this.getResizeCb();
		
		this.states = states;
		this.loaded_version = loaded_version;
		
		if (window.addEventListener) {
			window.addEventListener("resize", resize_cb, false);
		} else {
			window.attachEvent("onresize", resize_cb);
		}
		
		this.resize();
	};

	RespBreak.prototype.getStateVersion = function () {
		var state,
			width,
			ver;
			
		width = viewportSize.getWidth();
		
		for (ver = 0; ver < this.states.length; ver++) {
			state = this.states[ver];
			if (state.ishere(width)) {
				return parseInt(ver, 10);
			}
		}
		
		return null;
	};

	RespBreak.prototype.getResizeCb = function () {
		var obj = this;
		return function() {
			obj.resize();
		};
	};

	RespBreak.prototype.resize = function () {
		var from_version = this.loaded_version,
			to_version = this.getStateVersion(),
			is_upgrade = to_version >= from_version,
			phases = [],
			origin_ind,
			terminal_ind,
			ind,
			phasei,
			state,
			version;
			
		if (from_version === to_version) {
			return;
		}
			
		if (is_upgrade) {
			origin_ind = to_version;
			terminal_ind = from_version + 1;
		} else {
			origin_ind = from_version;
			terminal_ind = to_version + 1;
		}
		
		ind = origin_ind;
		while (Math.abs(ind - terminal_ind + 1) > 0.01) {
			phases.push(ind);
			ind -= 1;
		}
		
		if (is_upgrade) {
			phases.reverse();
		}
		
		for (phasei = 0; phasei < phases.length; phasei++) {
			version = phases[phasei];
			state = this.states[version];
			if (is_upgrade) {
				state.up();
			} else {
				state.down();
			}
		}
		
		this.loaded_version = to_version;
	};
	
	return RespBreak;
})(window, document);
/*! viewportSize | Author: Tyson Matanich, 2013 | License: MIT */
(function(n){n.viewportSize={},n.viewportSize.getHeight=function(){return t("Height")},n.viewportSize.getWidth=function(){return t("Width")};var t=function(t){var f,o=t.toLowerCase(),e=n.document,i=e.documentElement,r,u;return n["inner"+t]===undefined?f=i["client"+t]:n["inner"+t]!=i["client"+t]?(r=e.createElement("body"),r.id="vpw-test-b",r.style.cssText="overflow:scroll",u=e.createElement("div"),u.id="vpw-test-d",u.style.cssText="position:absolute;top:-1000px",u.innerHTML="<style>@media("+o+":"+i["client"+t]+"px){body#vpw-test-b div#vpw-test-d{"+o+":7px!important}}<\/style>",r.appendChild(u),i.insertBefore(r,e.head),f=u["offset"+t]==7?i["client"+t]:n["inner"+t],i.removeChild(r)):f=n["inner"+t],f}})(this);

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
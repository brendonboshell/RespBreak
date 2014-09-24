var RespBreak = {
	/*
		The _getWidth function is based on code from 'viewportSize'
		by Tyson Matanich, released under the MIT license.

		https://github.com/tysonmatanich/viewportSize/
	 */
	_getWidth: function () {
		var width,
				de = document.documentElement,
				body,
				div;

		if (typeof window.innerWidth === "undefined") {
			width = de.clientWidth;
		} else if (window.innerWidth !== de.clientWidth) {
			if (typeof this.isCW !== "undefined") {
				// we've cached the width that was accurate
				width = this.isCW ? de.clientWidth : window.innerWidth;
			} else {
				body = document.createElement("body");
				body.id = "lVW";
				body.style.cssText = "overflow:scroll";
				div = document.createElement("div");
				div.id = "qVo";
				div.style.cssText = "position:absolute;top:-1000px";
				div.innerHTML = "<style>@media(width:" + de.clientWidth + "px){body#lVW div#qVo{width:7px!important}}</style>";
				body.appendChild(div);
				de.insertBefore(body, document.head);

				if (div.offsetWidth == 7) {
					width = de.clientWidth;
					this.isCW = true;
				} else {
					size = window.innerWidth;
					this.isCW = false;
				}

				de.removeChild(body);
			}
		} else {
			width = window.innerWidth;
		}

		return width;
	},
	init: function () {
		var resizeCb,
				self = this;

		this.states = [];
		this.cbs = {};
		this.prevWidth = 0;
		resizeCb = function () {
			self.resize();
		};

		if (window.addEventListener) {
			window.addEventListener("resize", resizeCb, false);
		} else {
			window.attachEvent("onresize", resizeCb);
		}
	},
	addState: function (stateName, minWidth, maxWidth) {
		if (!maxWidth) {
			maxWidth = 10e8;
		}

		this.states.push({
			name: stateName,
			min: minWidth,
			max: maxWidth
		});
	},
	_addCb: function (name, action, cbFun) {
		var self = this,
				cb,
				state,
				i;

		if (typeof this.cbs[name] === "undefined") {
			this.cbs[name] = {};
		}

		if (typeof this.cbs[name][action] === "undefined") {
			this.cbs[name][action] = [];
		}

		for (i = 0; i < this.states.length; i++) {
			if (this.states[i].name === name) {
				state = this.states[i];
			}
		}

		cb = {
			fun: cbFun,
			prevWidth: -10e8
		};
		this.cbs[name][action].push(cb);
		self.resizeCb(cb, state, action, this._getWidth());
	},
	enter: function (stateName, cb) {
		return this._addCb(stateName, "enter", cb);
	},
	strictEnter: function (stateName, cb) {
		return this._addCb(stateName, "strictEnter", cb);
	},
	exit: function (stateName, cb) {
		return this._addCb(stateName, "exit", cb);
	},
	strictExit: function (stateName, cb) {
		return this._addCb(stateName, "strictExit", cb);
	},
	resizeCb: function (cb, state, action, curWidth) {
		var canCall = false,
				prevWidth = cb.prevWidth;

		switch (action) {
			case "enter":
				canCall = (!(prevWidth >= state.min && prevWidth <= state.max) &&
						(curWidth >= state.min && curWidth <= state.max));
				break;
			case "strictEnter":
				canCall = ((prevWidth < state.min && curWidth >= state.min) ||
						(prevWidth > state.max && curWidth <= state.max));
				break;
			case "exit":
				canCall = (prevWidth >= state.min && prevWidth <= state.max &&
						!(curWidth >= state.min && curWidth <= state.max));
				break;
			case "strictExit":
				canCall = ((prevWidth <= state.max && curWidth > state.max) ||
						(prevWidth >= state.min && curWidth < state.min));
				break;
		}

		cb.prevWidth = curWidth;
		if (canCall) {
			cb.fun();
		}
	},
	resize: function () {
		var state,
				name,
				action,
				curWidth = this._getWidth(),
				i,
				j,
				increasing = curWidth > this.prevWidth,
				actions = ["enter", "exit", "strictEnter", "strictExit"],
				k;

		for (i = 0; i < this.states.length; i++) {
			state = this.states[increasing ? i : (this.states.length - i - 1)];
			name = state.name;

			for (k = 0; k < actions.length; k++) {
				action = actions[k];

				if (this.cbs[name] && this.cbs[name][action]) {
					for (j = 0; j < this.cbs[name][action].length; j++) {
						this.resizeCb(
							this.cbs[name][action][j],
							state,
							action,
							curWidth
						);
					}
				}
			}
		}

		this.prevWidth = curWidth;
	}
};

RespBreak.init();

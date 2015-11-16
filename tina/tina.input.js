Tina.Input = function (T) {
	var KEY_NAMES = {LEFT: 37, RIGHT: 39, SPACE: 32, UP: 38, DOWN: 40, ENTER: 13, Z: 90, X: 88, C: 67,
		J: 74, K: 75, W: 87, A: 65, S: 83, D: 68, YI: 97, ER: 98, SAN: 99};

	var DEFAULT_KEYS = {
		LEFT: 'left', RIGHT: 'right', UP: 'up', DOWN: 'down', SPACE: 'space', ENTER: 'enter', Z: 'z',
		X: 'x', C: 'c', J: 'j', K: 'k', W: 'w', A: 'a', S: 's', D: 'd', YI: 'num_1', ER: 'num_2', SAN: 'num_3'
	};

	T.inputs = {};

	T.InputSystem = T.Evented.extend({
		keys: {},
		keyboardEnabled: false,

		bindKey: function (key, name) {
			T.input.keys[KEY_NAMES[key] || key] = name;
		},

		keyboardControls: function (keys) {
			keys = keys || DEFAULT_KEYS;
			_.each(keys, function (name, key) {
				this.bindKey(key, name);
			}, T.input);
			this.enableKeyboard();
		},

		enableKeyboard: function () {
			if (this.keyboardEnabled) return false;
			T.cvs.tabIndex = 0;
			T.cvs.style.outline = 0;

			T.cvs.keydown = function (onkeydown) {
				window.addEventListener("keydown", onkeydown, false);
			};

			T.cvs.keyup = function (onkeyup) {
				window.addEventListener("keyup", onkeyup, false);
			};

			T.cvs.keydown(function (e) {
				// console.log("has key down");
				if (T.input.keys[e.keyCode]) {
					var actionName = T.input.keys[e.keyCode];
					T.inputs[actionName] = true;
					T.input.emit(actionName);
					T.input.emit("keydown", e.keyCode);
				}
				e.stopPropagation();
				e.preventDefault();
			});

			T.cvs.keyup(function (e) {
				if (T.input.keys[e.keyCode]) {
					var actionName = T.input.keys[e.keyCode];
					T.inputs[actionName] = false;
					T.input.emit(actionName + "Up");
					T.input.emit("keyup", e.keyCode);
				}
				e.stopPropagation();
				e.preventDefault();
			});

			return this.keyboardEnabled = true;
		}

	});

	T.input = new T.InputSystem();

	T.controls = function () {
		T.input.keyboardControls();
		return T;
	};
};

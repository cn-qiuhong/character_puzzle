// -----------------------------------------------------------------------------
// Native Object extensions
Number.prototype.map = function (istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

Number.prototype.limit = function (min, max) {
	return Math.min(max, Math.max(min, this));
};

Number.prototype.round = function (precision) {
	precision = Math.pow(10, precision || 0);
	return Math.round(this * precision) / precision;
};

Number.prototype.toInt = function () {
	return (this | 0);
};

Number.prototype.toRad = function () {
	return (this / 180) * Math.PI;
};

Number.prototype.toDeg = function () {
	return (this * 180) / Math.PI;
};

Array.prototype.erase = function (item) {
	for (var i = this.length; i--;) {
		if (this[i] == item) {
			this.splice(i, 1);
		}
	}
	return this;
};

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function () {
	for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
	return this;
};

// -----------------------------------------------------------------------------
// _ Namespace
(function (window) {

	var idIndex = 0;

	window.$ = function (selector) {
		return selector.charAt(0) == '#' ?
			document.getElementById(selector.substr(1)) :
			document.getElementsByTagName(selector);
	};

	window.$new = function (name) {
		return document.createElement(name);
	};

	window._ = {

		extend: function (dest, source) {
			dest = dest || {};
			if (!source) {
				return dest;
			}
			for (var prop in source) {
				dest[prop] = source[prop];
			}
			return dest;
		},

		clone: function (obj) {
			return _.extend({}, obj);
		},

		copy: function (obj) {
			if (!obj || typeof(obj) != 'object' ||
				obj instanceof HTMLElement ||
				obj instanceof Class) {
				return obj;
			} else if (obj instanceof Array) {
				var c = [];
				for (var i = 0, l = obj.length; i < l; ++i) {
					c[i] = _.copy(obj[i]);
				}
				return c;
			} else {
				var c = {};
				for (var i in obj) {
					c[i] = _.copy(obj[i]);
				}
				return c;
			}
		},

		defaults: function (dest, source) {
			if (!source) {
				return dest;
			}
			for (var prop in source) {
				if (dest[prop] === void 0) {
					dest[prop] = _.copy(source[prop]);
				}
			}
			return dest;
		},

		modify: function (dest, source) {
			if (!source) {
				return dest;
			}
			for (var prop in source) {
				if (!(dest[prop] === void 0)) {
					dest[prop] = _.copy(source[prop]);
				}
			}
			return dest;
		},

		has: function (obj, key) {
			return Object.prototype.hasOwnProperty(obj, key);
		},

		isString: function (obj) {
			return typeof obj === "string";
		},

		isNumber: function (obj) {
			return Object.prototype.toString.call(obj) === "[object Number]";
		},

		isFunction: function (obj) {
			return Object.prototype.toString.call(obj) === "[object Function]";
		},

		isObject: function (obj) {
			return Object.prototype.toString.call(obj) === "[object Object]";
		},

		isArray: function (obj) {
			return Object.prototype.toString.call(obj) === "[object Array]";
		},

		isUndefined: function (obj) {
			return obj === void 0;
		},

		popProperty: function (obj, property) {
			var val = obj[property];
			delete obj[property];
			return val;
		},

		each: function (obj, iterator, context) {
			if (obj == null) {
				return;
			}
			if (obj.forEach) {
				obj.forEach(iterator, context);
			} else if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; ++i) {
					iterator.call(context, obj[i], i, obj);
				}
			} else {
				for (var key in obj) {
					iterator.call(context, obj[key], key, obj);
				}
			}
		},

		invoke: function (arr, property, arg1, arg2) {
			if (arr == null) {
				return;
			}
			for (var i = 0, l = arr.length; i < l; ++i) {
				arr[i][property](arg1, arg2);
			}
		},

		detect: function (obj, iterator, context, arg1, arg2) {
			var result;
			if (obj == null) {
				return false;
			}
			if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; ++i) {
					result = iterator.call(context, obj[i], i, arg1, arg2);
					if (result) {
						return result;
					}
				}
				return false;
			} else {
				for (var key in obj) {
					result = iterator.call(context, obj[key], key, arg1, arg2);
					if (result) {
						return result;
					}
				}
				return false;
			}
		},

		filter: function (obj, iterator, context, arg1, arg2) {
			var result = [];
			var item;
			if (obj == null) {
				return false;
			}
			if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; ++i) {
					item = iterator.call(context, obj[i], i, arg1, arg2);
					if (item) {
						result.push(item);
					}
				}
				return result;
			} else {
				for (var key in obj) {
					result = iterator.call(context, obj[key], key, arg1, arg2);
					if (item) {
						result.push(item);
					}
				}
				return result;
			}
		},

		map: function (obj, iterator, context) {
			var results = [];
			if (obj == null) {
				return results;
			}
			if (!_.isNumber(obj) && obj.map) {
				return obj.map(iterator, context);
			}
			_.each(obj, function (value, index, list) {
				results[results.length] = iterator.call(contex, value, index, list);
			});
			if (obj.length === +obj.length) {
				results.length = obj.length;
			}
			return results;
		},

		uniq: function (arr) {
			arr = arr.slice().sort();
			var output = [];

			var last = null;
			for (var i = 0; i < arr.length; ++i) {
				if (arr[i] != void 0 && last !== arr[i]) {
					output.push(arr[i]);
				}
				last = arr[i];
			}
			return output;
		},

		keys: Object.keys || function (obj) {
			if (_.isObject(obj)) {
				throw new TypeError("Invalid object");
			}
			var keys = [];
			for (var key in obj) {
				if (_.has(obj, key)) {
					keys[keys.length] = key;
				}
			}
			return keys;
		},

		range: function (start, stop, step) {
			step = step || 1;

			var len = Math.max(Math.ceil(Math.abs(stop - start) / step), 0);
			var idx = 0;
			var range = new Array(len);

			while (idx < len) {
				range[idx++] = start;
				if (start > stop)
					start -= step;
				else
					start += step;
			}
			return range;
		},

		uniqueId: function () {
			return idIndex++;
		}

	};

})(window);

// -----------------------------------------------------------------------------
// Simple JavaScript Inheritance
//
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/
//
// MIT Licensed
//
(function () {
	var initializing = false,
		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	this.Class = function () {
	};

	var inject = function (prop) {
		var proto = this.prototype;
		var _super = {};
		for (var name in prop) {
			if (typeof(prop[name]) == "function" &&
				typeof(proto[name]) == "function" &&
				fnTest.test(prop[name])) {
				_super[name] = proto[name];
				proto[name] = (function (name, fn) {
					return function () {
						var tmp = this._super;
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				proto[name] = prop[name];
			}
		}
	};
	// Create a new Class that inherits from this class
	Class.extend = function (prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			if (typeof(prop[name]) == "function" &&
				typeof(_super[name]) == "function" &&
				fnTest.test(prop[name])) {
				prototype[name] = (function (name, fn) {
					return function () {
						var tmp = this._super;
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				prototype[name] = prop[name];
			}
		}

		// The dummy class constructor
		function Class() {
			if (!initializing) {

				for (var p in this) {
					if (typeof(this[p]) != 'function') {
						this[p] = _.copy(this[p]); // deep copy;
					}
				}
				if (this.init)
					this.init.apply(this, arguments);
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;
		Class.inject = inject;

		return Class;
	};
})();

var Tina = function (ops) {
	var T = {};

	// ----------------------------------------------------------------------------
	// - Profile
	T.Stats = Stats || false;

	T.notice = {};
	T.options = {
		imagePath: "img/",
		audioPath: "audio/",
		dataPath: "data/",
		audioSupported: ["mp3", "ogg"],
		sound: true,
		clearColor: '#000'
	};

	if (ops) {
		_.extend(T.options, ops);
	}

	T._normalizeArg = function (arg) {
		if (_.isString(arg)) {
			arg = arg.replace(/\s+/g, '').split(",");
		}
		if (!_.isArray(arg)) {
			arg = [arg];
		}
		return arg;
	};

	T.extend = function (obj) {
		_.extend(T, obj);
		return T;
	};

	T.requires = function (mod) {
		_.each(T._normalizeArg(mod), function (m) {
			m = Tina[m] || m;
			if (_.isString(m)) console.log("Can not load module: " + m);
			m(T);
		});
		return T;
	};

	T.gameLoop = function (callback) {
		T.lastGameLoopFame = new Date().getTime();
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
		if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
		T.gameLoopCallbackWrapper = function () {
			if (T.stats)
				T.stats.begin();
			var now = new Date().getTime();
			T.loop = window.requestAnimationFrame(T.gameLoopCallbackWrapper);
			var dt = now - T.lastGameLoopFame;
			if (dt > 1000) {
				dt = 100;
			}
			callback.call(T, dt / 1000);
			T.lastGameLoopFame = now;
			if (T.stats)
				T.stats.end();
		};
		window.requestAnimationFrame(T.gameLoopCallbackWrapper);
	};

	T.pause = function () {
		if (T.loop) {
			window.cancelAnimationFrame(T.loop);
		}
		T.loop = null;
	};

	T.unpause = function () {
		if (!T.loop) {
			T.lastGameLoopFame = new Date().getTime();
			T.loop = window.requestAnimationFrame(T.gameLoopCallbackWrapper);
		}
	};

	T.Evented = Class.extend({
		on: function (event, target, callback) {
			if (!callback) {
				callback = target;
				target = null;
			}

			if (_.isString(callback)) {
				if (!target) {
					throw new Error("Invalid target");
				}
				callback = target[callback];
			}

			this._listeners = this._listeners || {};
			this._listeners[event] = this._listeners[event] || [];
			this._listeners[event].push([target || this, callback]);

			if (target) {
				if (!target._events) {
					target._events = [];
				}
				target._events.push([this, event, callback]);
			}
		},
		emit: function (event, data) {
			if (this._listeners && this._listeners[event]) {
				for (var i = 0, len = this._listeners[event].length; i < len; ++i) {
					var listener = this._listeners[event][i];
					listener[1].call(listener[0], data);
				}
			}
		},
		hasListener: function (event, target, callback) {
			if (!target) {
				if (this._listeners && this._listeners[event]) {
					return true;
				}
			} else {
				var l = this._listeners && this._listeners[event];
				if (l) {
					for (var i = l.length - 1; i >= 0; i--) {
						if (l[i][0] == target) {
							if (!callback || callback == l[i][1]) {
								return true;
							}
						}
					}
				}
			}
			return false;
		},
		removeListener: function (event, target, callback) {
			if (!target) {
				if (this._listeners && this._listeners[event]) {
					delete this._listeners[event];
					return;
				}
			} else {
				var l = this._listeners && this._listeners[event];
				if (l) {
					for (var i = l.length - 1; i >= 0; i--) {
						if (l[i][0] == target) {
							if (!callback || callback == l[i][1]) {
								this._listeners[event].splice(i, 1);
							}
						}
					}
				}
			}
		},
		removeAllListeners: function () {
			if (this._events) {
				for (var i = 0, len = this._events.length; i < len; i++) {
					var boundEvent = this._events[i],
						source = boundEvent[0],
						event = boundEvent[1];
					source.removeListener(event, this);
				}
			}
			if (this._listeners)
				this._listeners = null;
		}
	});

	T.components = {};

	T.c = function (name, component) {
		component.name = name;
		T.components[name] = T.Component.extend(component);
	};

	T.Component = T.Evented.extend({
		init: function (base) {
			this.base = base;
			if (this.extend) _.extend(base, this.extend);
			base[this.name] = this;
			base.activeComponents.push(this.name);
			if (this.merged) this.merged();
		},
		destroy: function () {
			if (this.extend) {
				var extensions = _.keys(this.extend);
				for (var i = 0, len = extensions.length; i < len; i++) {
					delete this.base[extensions[i]];
				}
			}

			delete this.base[this.name];

			var idx = this.base.activeComponents.indexOf(this.name);
			if (idx != -1) {
				this.base.activeComponents.splice(idx, 1);
			}

			this.removeAllListeners();
			if (this.destroyed) this.destroyed();
		}
	});

	T.GameObject = T.Evented.extend({
		hasCom: function (component) {
			return this[component] ? true : false;
		},

		merge: function (components) {
			components = T._normalizeArg(components);

			if (!this.activeComponents) {
				this.activeComponents = [];
			}
			for (var i = 0, len = components.length; i < len; i++) {
				var name = components[i],
					comp = T.components[name];
				if (!this.hasCom(name) && comp) {
					var c = new comp(this);
					this.emit('mergeComponent', c);
				}
			}
			return this;
		},

		purge: function (components) {
			components = T._normalizeArg(components);

			for (var i = 0, len = components.length; i < len; i++) {
				var name = components[i];
				if (name && this.hasCom(name)) {
					this.emit('purgeComponent', this[name]);
					this[name].destroy();
				}
			}
			return this;
		},

		destroy: function () {
			if (this.destroyed) {
				return;
			}
			this.removeAllListeners();
			if (this.parent && this.parent.remove) {
				this.parent.remove(this);
			}
			this.emit('removed');
			this.destroyed = true;
		}
	});

	T.setup = function (id, options) {
		var touchDevice = 'ontouchstart' in document;
		T.touchDevice = touchDevice;

		document.body.style.padding = 0;
		document.body.style.margin = 0;
		document.body.style.border = 0;

		if (!_.isString(id)) {
			options = id;
			id = "tina_canvas";
		}
		options = options || {};
		T.cvs = $("#" + id);
		if (!T.cvs) {
			var canvas = $new("canvas");
			canvas.id = id;
			document.body.appendChild(canvas);
			T.cvs = canvas;
		}
		T.cvs.style.display = "block";
		T.ctx = T.cvs.getContext && T.cvs.getContext("2d");

		T.cvs.width = Math.min(options.width || 420, 4096) + (options.x || 0);
		T.cvs.height = Math.min(options.height || 320, 4096) + (options.y || 0);
		T.ctx.translate(options.x || 0, options.y || 0);

		console.log("w: " + T.cvs.width +
			" h: " + T.cvs.height);
		var _pixelRatio = options.pixelRatio || (touchDevice ? (function () {
				var devicePixelRatio = window.devicePixelRatio || 1,
					backingStoreRatio = T.cvs.webkitBackingStorePixelRatio ||
						T.cvs.mozBackingStorePixelRatio ||
						T.cvs.msBackingStorePixelRatio ||
						T.cvs.oBackingStorePixelRatio ||
						T.cvs.backingStorePixelRatio ||
						1;
				return devicePixelRatio / backingStoreRatio;
			})() : 1);

		options.scale = options.scale || {
				x: _pixelRatio,
				y: _pixelRatio
			};
		T.scale = options.scale;

		T.width = parseInt(T.cvs.width - (options.x || 0) / T.scale.x, 10);
		T.height = parseInt(T.cvs.height / T.scale.y, 10);
		T.canvas_tran_x = options.x || 0;
		T.canvas_tran_y = options.y || 0;
		// TODO: 处理屏幕旋转
		window.addEventListener("orientationchange", function () {
			setTimeout(function () {
				window.scrollTo(0, 0);
			}, 0);
		});

		//帧率，单帧时间，内存
		//if (T.Stats) {
		//	console.log('******** Status *******');
		//	T.stats = new T.Stats();
		//	T.stats.setMode(0);
		//	T.stats.domElement.style.position = 'absolute';
		//	T.stats.domElement.style.left = '0px';
		//	T.stats.domElement.style.top = '0px';
		//	document.body.appendChild(T.stats.domElement);
		//}

		return T;
	};

	T.clear = function (color) {
		color = color || T.options.clearColor;
		T.ctx.fillStyle = color;
		T.ctx.fillRect(0, 0, T.cvs.width, T.cvs.height);
		// T.ctx.clearRect(0,0,T.cvs.width,T.cvs.height);
	};

	T.assetTypes = {
		// Image
		png: "Image",
		jpg: "Image",
		gif: "Image",
		jpeg: "Image",
		// Audio
		mp3: "Audio",
		ogg: "Audio",
		wav: "Audio",
		m4a: "Audio"
	};

	T._fileExtension = function (filename) {
		var fileParts = filename.split("."),
			fileExt = fileParts[fileParts.length - 1];
		return fileExt;
	};

	T._removeExtension = function (filename) {
		return filename.replace(/\.(\w{3,4})$/, "");
	};

	T.assetType = function (asset) {
		var fileExt = T._fileExtension(asset).toLowerCase();
		return T.assetTypes[fileExt] || "Other";
	};

	T.loadAssetImage = function (key, src, callback, errorCallback) {
		var img = new Image();
		img.onload = function () {
			callback(key, img);
		};
		img.onerror = errorCallback;
		img.src = T.options.imagePath + src;
	};

	T.audioMimeTypes = {
		mp3: "audio/mpeg",
		ogg: "audio/ogg; codecs=\"vorbis\"",
		m4a: "audio/m4a",
		wav: "audio/wav"
	};

	T.loadAssetAudio = function (key, src, callback, errorCallback) {
		if (!$new("audio").play || !T.options.sound) {
			callback(key, null);
			return null;
		}

		var snd = new Audio(),
			baseName = T._removeExtension(src),
			extension = null,
			filename = null;
		// Find a supported type
		extension = _.detect(T.options.audioSupported, function (extension) {
			return snd.canPlayType(T.audioMimeTypes[extension]) ? extension : null;
		});

		if (!extension) {
			callback(key, null);
			return null;
		}

		snd.addEventListener("error", errorCallback);

		if (!T.touchDevice) {
			snd.addEventListener("canplaythrough", function () {
				callback(key, snd);
			});
		}
		snd.src = T.options.audioPath + baseName + "." + extension;
		snd.load();

		return snd;
	};

	T.loadAssetOther = function (key, src, callback, errorCallback) {
		var request = new XMLHttpRequest();

		var fileParts = src.split("."),
			fileExt = fileParts[fileParts.length - 1].toLowerCase();

		request.onreadystatechange = function () {
			if (request.readyState === 4) {
				if (request.status === 200) {
					if (fileExt === 'json') {
						callback(key, JSON.parse(request.responseText));
					} else {
						callback(key, request.responseText);
					}
				} else {
					errorCallback();
				}
			}
		};
		request.open("GET", T.options.dataPath + src, true);
		request.send(null);
		return request;
	};

	T.assets = {};

	T.getAsset = function (name) {
		if (!T.assets[name]&&name!=null) {
			console.log("Error get asset: " + name);
		}
		return T.assets[name];
	};

	T.load = function (assets, callback, ops) {
		var assetObj = {};
		if (!ops) {
			ops = {};
		}

		var progressCallback = ops.progressCallback || function (status, total) {
				console.log("loading: " + status + "%" + total);
				var w = (T.width - T.canvas_tran_x) * 0.6;
				var h = T.height * 0.04;
				var x = (T.width + T.canvas_tran_x - w) / 2;
				var y = (T.height - h) / 2;
				T.clear(T.options.clearColor);
				T.ctx.save();
				T.ctx.fillStyle = '#fff';
				T.ctx.fillRect(x - 1, y - 1, w + 3, h + 3);

				T.ctx.fillStyle = '#000';
				T.ctx.fillRect(x + 1, y + 1, w - 1, h - 1);

				T.ctx.fillStyle = '#fff';
				T.ctx.fillRect(x + 4, y + 4, w * status / total - 8, h - 8);

				T.ctx.restore();
			};

		var errors = false,
			errorCallback = function (itm) {
				errors = true;
				(ops.errorCallback ||
				function (itm) {
					alert("Error Loading: " + itm);
				})(itm);
			};

		if (_.isArray(assets)) {
			_.each(assets, function (itm) {
				if (_.isObject(itm)) {
					_.extend(assetObj, itm);
				} else {
					assetObj[itm] = itm;
				}
			});
		} else if (_.isString(assets)) {
			assetObj[assets] = assets;
		} else {
			assetObj = assets;
		}

		var assetsTotal = _.keys(assetObj).length,
			assetsRemaininng = assetsTotal;

		var loadedCallback = function (key, obj) {
			if (errors) return;
			T.assets[key] = obj;
			assetsRemaininng--;
			// Update our progress if we have it
			if (progressCallback) {
				progressCallback(assetsTotal - assetsRemaininng, assetsTotal);
			}

			if (assetsRemaininng === 0 && callback) {
				callback.apply(T);
			}
		};

		// Now actually load each asset
		_.each(assetObj, function (itm, key) {
			var assetType = T.assetType(itm);

			if (T.assets[key]) {
				loadedCallback(key, T.assets[key]);
			} else {
				T["loadAsset" + assetType](key, itm,
					loadedCallback,
					function () {
						errorCallback(itm);
					});
			}
		});
	};

	T.preloads = [];

	T.preload = function (arg, options) {
		if (_.isFunction(arg)) {
			T.load(_.uniq(T.preloads), arg, options);
			T.preloads = [];
		} else {
			T.preloads = T.preloads.concat(arg);
		}
	};

	return T;
};

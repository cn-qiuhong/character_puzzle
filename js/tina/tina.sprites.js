Tina.Sprites = function (T) {

	T.SpriteSheet = Class.extend({
		init: function (name, asset, ops) {
			_.extend(this, {
				name: name,
				asset: asset,
				w: T.getAsset(asset).width,
				h: T.getAsset(asset).height,
				tw: 64,
				th: 64,
				sx: 0,
				sy: 0
			});
			if (ops) {
				_.modify(this, ops);
			}
			this.cols = this.cols ||
				Math.floor(this.w / this.tw);
		},

		frameX: function (frame) {
			return (frame % this.cols) * this.tw + this.sx;
		},

		frameY: function (frame) {
			return Math.floor(frame / this.cols) * this.th + this.sy;
		},
		render: function (ctx, x, y, frame, dw, dh, asset) {
			asset = asset || T.getAsset(this.asset);
			if (!ctx) {
				ctx = T.ctx;
			}
			ctx.drawImage(asset,
				this.frameX(frame), this.frameY(frame),
				this.tw, this.th,
				x, y,
				dw, dh
			);
		}
	});

	T.sheets = {};

	T.sheet = function (name, asset, ops) {
		if (asset) {
			T.sheets[name] = new T.SpriteSheet(name, asset, ops);
		}
		return T.sheets[name];
	};

	T.compileSheets = function (imageAsset, spriteDataAsset) {
		var data = T.getAsset(spriteDataAsset);
		_.each(data, function (spriteData, name) {
			T.sheet(name, imageAsset, spriteData);
		});
	};

	T.Sprite = T.GameObject.extend({
		asset: null,
		sheet: '',
		sprite: '',
		x: 0,
		y: 0,
		z: 0,
		w: 0,
		h: 0,
		center: {x: 0, y: 0},
		rotation: 0,
		scale: {x: 1, y: 1},
		frame: 0,
		type: 0,
		alpha: 1,
		index:0,
		active: true,
		background: false,

		init: function (ops) {
			if (ops) {
				_.modify(this, ops);
			}
			if ((!this.w || !this.h)) {
				if (this.getAsset()) {
					this.w = this.w || this.getAsset().width;
					this.h = this.h || this.getAsset().height;
				} else if (this.getSheet()) {
					this.w = this.w || this.getSheet().tw;
					this.h = this.h || this.getSheet().th;
				}
			}
			this.id = this.id || _.uniqueId();
		},

		getAsset: function () {
			return T.getAsset(this.asset);
		},

		getSheet: function () {
			return T.sheet(this.sheet);
		},

		render: function (ctx) {
			if (this.active) {
				if (!ctx) {
					ctx = T.ctx;
				}
				var p = this;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation * Math.PI / 180);
				ctx.scale(p.scale.x, p.scale.y);
				ctx.globalAlpha = p.alpha;
				if (p.sheet) {
					var sheet = this.getSheet();
					if (sheet)
						sheet.render(ctx, -p.center.x, -p.center.y, p.frame, p.w, p.h);
				} else if (p.asset) {
					if (p.background) {
						ctx.drawImage(T.getAsset(p.asset), world_x, 0, 1280, 720,
							-p.center.x, -p.center.y,
							p.w, p.h
						);
					} else {
						ctx.drawImage(T.getAsset(p.asset),
							-p.center.x, -p.center.y,
							p.w, p.h
						);
					}
				}
				ctx.restore();
				this.emit("render", ctx);
			}
		},

		update: function (dt) {
			this.emit("update", dt);
		}
	});

	T._frameAnimations = {};

	// frameAnimations
	T.fas = function (sprite, animations) {
		if (!T._frameAnimations[sprite]) T._frameAnimations[sprite] = {};
		_.extend(T._frameAnimations[sprite], animations);
	};

	// frameAnimation
	T.fa = function (sprite, name) {
		return T._frameAnimations[sprite] && T._frameAnimations[sprite][name];
	};

	T.c("frameAnim", {
		faName: null,
		faPriority: -1,
		faFrame: 0,
		faTime: 0,
		_fa: {},
		merged: function () {
			var p = this.base;
			p.on("update", this, "update");
		},
		extend: {
			play: function (name, priority, rate, opts) {
				this.frameAnim.play(name, priority, rate, opts);
			}
		},
		update: function (dt) {
			var base = this.base;
			if (this.faName) {
				var fa = T.fa(base.sprite, this.faName);
				var rate = this._fa.rate || fa.rate || this.rate;
				var stepped = 0;
				this.faTime += dt;
				if (this.faChanged) {
					this.faChanged = false;
				} else {
					this.faTime += dt;
					if (this.faTime > rate) {
						stepped = Math.floor(this.faTime / rate);
						this.faTime -= stepped * rate;
						this.faFrame += stepped;
					}
				}
				if (stepped > 0) {
					if (this.faFrame >= fa.frames.length) {
						var loop = (this._fa.loop != "undefine") ? this._fa.loop : fa.loop;
						if (loop !== true || fa.next) {
							this.faFrame = fa.frames.length - 1;
							this._fa.rate = null;
							base.emit("frameAnimEnd");
							base.emit("frameAnimEnd." + this.faName);
							this.faName = null;
							this.faPriority = -1;
							if (fa.emit)
								base.emit(fa.emit, fa.emitData);
							if (fa.next)
								this.play(fa.next, fa.nextPriority);
							return;
						} else {
							base.emit("frameAnimLoop");
							base.emit("frameAnimLoop." + this.faName);
							this.faFrame = this.faFrame % fa.frames.length;
						}
					}
					base.emit("frameAnimFrame");
				}
				base.sheet = fa.sheet || base.sheet;
				base.frame = fa.frames[this.faFrame];
			}
		},

		play: function (name, priority, rate, opts) {
			var base = this.base;
			priority = priority || 0;
			if (name != this.faName && priority >= this.faPriority) {
				this.faName = name;
				this.faChanged = true;
				this.faTime = 0;
				this.faFrame = 0;
				this.faPriority = priority;

				this._fa.rate = rate;
				if (opts) {
					_.extend(this._fa, opts);
				}

				base.emit("frameAnim");
				base.emit("frameAnim." + this.faName);
			}
		}
	});

	return T;
};

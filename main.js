var pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 2;
var info_screen = {
	w: 1280,
	h: 720
};
var info_screen0 = {
	w: window.innerWidth,
	h: window.innerHeight
};
//判断是否是移动端
var bro = function () {
	var browser = navigator.userAgent;
	var result = browser.indexOf('Android') || browser.indexOf('iPhone') || browser.indexOf('iPad') || browser.indexOf('Mobile');
	if (result > -1) return true;
	return false;
}();
if (bro) {
	info_screen0 = {
		w: window.screen.height,
		h: window.screen.width
	};
	canvas_x = canvas_y = 0;
}
//显示比例
var sc_x = info_screen0.w / info_screen.w;
var sc_y = info_screen0.h / info_screen.h;

var GAME_NAME = "character_puzzle";

//主函数，入口
var main = function () {
	var T = Tina().requires("Input,Sprites,Scenes,Text,Entities")
		.setup("canvas", {
			width: info_screen0.w,
			height: info_screen0.h,
			pixelRatio: pixelRatio,
			scale: {
				x: sc_x,
				y: sc_y
			}
		})
		.controls();

	var picture_c, stage_g, level, down_g = false, downable_g, part_g, maxlevel, record, bgmusic, duihuaindex,
		clear_g, addedclear, targetindex, tanchuang, limit_g, pet_g;
	var data_g = [
		[
			{asset: 'muheng.png', w: 278, h: 38, center: {x: 139, y: 19}, index: 1, x: 687, y: 267},
			{asset: 'mushu.png', w: 39, h: 315, center: {x: 19, y: 157}, index: 2, x: 683, y: 340},
			{asset: 'mupie.png', w: 129, h: 136, center: {x: 64, y: 68}, index: 3, x: 600, y: 387},
			{asset: 'muna.png', w: 134, h: 96, center: {x: 67, y: 48}, index: 4, x: 772, y: 375}
		],
		[
			{asset: 'shan1.png', w: 24, h: 197, center: {x: 12, y: 98}, index: 1, x: 640, y: 270},
			{asset: 'shan2.png', w: 213, h: 146, center: {x: 106, y: 73}, index: 2, x: 630, y: 325},
			{asset: 'shan3.png', w: 33, h: 140, center: {x: 16, y: 70}, index: 3, x: 740, y: 310}
		],
		[
			{asset: 'ri1.png', w: 33, h: 192, center: {x: 16, y: 96}, index: 1, x: 540, y: 288},
			{asset: 'ri2.png', w: 150, h: 183, center: {x: 75, y: 91}, index: 2, x: 625, y: 265},
			{asset: 'ri3.png', w: 102, h: 25, center: {x: 51, y: 12}, index: 3, x: 613, y: 278},
			{asset: 'ri4.png', w: 127, h: 24, center: {x: 63, y: 12}, index: 4, x: 625, y: 370}
		],
	];

	//动画播放
	var AnimPlayer = T.Entity.extend({
		time: 33, timing: 0, z: 110, open: false, added: false,
		init: function (ops) {
			this._super(ops);
			this.merge("frameAnim");
			this.on("down", function () {
				this.down();
			});
		},
		update: function (dt) {
			this._super(dt);
			this.action();
		},
		action: function () {
			this.anim();
		},
		anim: function () {
			this.play("anim");
		},
		down: function () {
		}
	});
	//按钮
	var Button = T.Sprite.extend({
		z: 10,
		init: function (ops) {
			this._super(ops);
			this.on("down", function () {
				this.down();
			});
		},
		down: function () {
		}
	});

	var Back = Button.extend({
		asset: 'fanhui.png', w: 150, h: 75, x: 1130
	});

	var Baiban = T.Sprite.extend({
		asset: 'baiban.png', w: 720, h: 720, x: -720, z: 5, limit: -250,
		init: function () {
			limit_g = this.limit - this.x;
		},
		update: function () {
			if (tanchuang && this.x < this.limit) {
				this.x += 10;
			}
		}
	});
	//背景
	var BG = T.Sprite.extend({
		w: 1280, h: 720, time: 0, timing: 0,
		init: function (asset, ops) {
			if (asset != null) this.asset = asset;
			this._super(ops);
			this.on('down', function (e) {
				this.down(e);
			});
		},
		update: function (dt) {
			this._super(dt);
			this.action();
		},
		action: function () {
		},
		down: function (e) {
		}
	});

	var ChooseLevel = T.Sprite.extend({
		asset: 'xuanguan.png', w: 1280, h: 720,
		init: function () {
			this.on("added", function () {
				var stage = this.parent;
				var d1g = new Button({w: 300, h: 300, x: 150, y: 235, asset: 'xuanguan_mu.png'});
				d1g.down = function () {
					level = 0;
					T.stageScene('game');
				};
				stage.add(d1g);
				var d2g = new Button({w: 300, h: 300, asset: 'xuanguan_shan.png', x: 500, y: 235});
				d2g.down = function () {
					level = 1;
					T.stageScene('game');
				};
				stage.add(d2g);
				var d3g = new Button({w: 300, h: 300, asset: 'xuanguan_ri.png', x: 850, y: 235});
				d3g.down = function () {
					level = 2;
					T.stageScene('game');
				};
				stage.add(d3g);
				var fanhui = new Back();
				fanhui.down = function () {
					T.stageScene('xuanzechongwu');
				};
				stage.add(fanhui);
			});
		}
	});
	//笔画演示
	var Demonstrate = AnimPlayer.extend({
		x: 500, y: 150, timing: 0, switchon: false, z: -1,
		init: function () {
			this._super();
			switch (level) {
				case 0:
				case 2:
					this.time = 240;
					break;
				case 1:
					this.time = 180;
					break;
			}
			this.setAnimSheet('sheet_' + level, 'sp_' + level);
		},
		action: function () {
			if (this.timing == 60) {
				this.z = 20;
				this.anim();
			}
			this.timing++;
			if (!this.switchon && this.timing > this.time) {
				this.switchon = downable_g = true;
			}
		},
		anim: function () {
			this.play('anim');
			T.getAsset('zi' + level + '.mp3').play();
		}
	});
	//游戏完成
	var GameClear = T.Sprite.extend({
		asset: 'clear.png', w: 353, h: 108, center: {x: 176, y: 54}, x: 640, y: 300, z: 5, added: false,
		init: function () {
			clear_g = true;
			this.oldw = this.w;
			this.oldh = this.h;
			this.oldcx = this.center.x;
			this.oldcy = this.center.y;
			this.on("added", function () {
				this.w /= 10;
				this.h /= 10;
				this.center.x /= 10;
				this.center.y /= 10;
			});
			if (record == null) record = {};
			if (record.level == null) record.level = 1;
			if (record.level <= level) record.level = level + 1;
			setStorage();
			level++;
		},
		update: function () {
			if (this.w < this.oldw) {
				this.w *= 1.1;
				this.h *= 1.1;
				this.center.x *= 1.1;
				this.center.y *= 1.1;
			} else if (!this.added) {
				this.added = true;
				if (level < maxlevel) {
					var next = new Button({
						x: 690,
						y: 400,
						asset: 'next.png',
						w: 200,
						h: 100
					});
					next.down = function () {
						T.stageScene('game');
					};
					this.parent.add(next);
				}
				var again = new Button({
					x: 390,
					y: 400,
					asset: 'onceagain.png',
					w: 200,
					h: 100
				});
				this.parent.add(again);
				again.down = function () {
					level--;
					T.stageScene('game');
				};
			}
		}
	});

	var OnceMore = Button.extend({
		asset: 'onceagain.png', w: 272, h: 105, x: 550, y: 610, added: false, timing: 0, time: 0,
		down: function () {
			if (!this.added) {
				this.added = true;
				this.timing = 0;
				demo_g.z = 20;
				demo_g.anim();
			}
		},
		update: function () {
			if (this.added) {
				this.timing++;
				if (this.timing > demo_g.time) {
					demo_g.z = -1;
					this.added = false;
				}
			}
		}
	});
	//开头动画
	var OP = T.Entity.extend({
		time: 120, //set how long goto t.scene('ready')
		timing: 0, z: 10, x: 420, y: 50,
		init: function () {
			this.merge("frameAnim");
			this.setAnimSheet("sheet_kaipian", "kaipian");
			this.on("added", function () {
				this.parent.add(new T.Sprite({
					asset: 'kaichang_b.png',
					w: 1280,
					h: 720,
					z: 5
				}));
				this.hdkj = new T.Sprite({
					asset: 'heidaokeji.png', w: 290, h: 112, x: -350, y: 500, z: 15
				});
				this.parent.add(this.hdkj);
				this.hxgzs = new T.Sprite({
					asset: 'huoxuangongzuoshi.png', w: 490, h: 61, x: 1350, y: 650, z: 15
				});
				this.parent.add(this.hxgzs);
				this.kcanim = new AnimPlayer({
					z: 11, time: 40 //set how long animplay
				});
				this.kcanim.setAnimSheet("sheet_kcanim", "kcanim");
				this.kcanim.action = function () {
					if (this.timing == 0) {
						this.play('ready');
					} else if (this.timing < this.time) {
						this.play("anim");
						this.timing++;
					} else {
						this.play("idle");
					}
				};
				this.parent.add(this.kcanim);
			});
		},
		update: function (dt) {
			this._super(dt);
			this.timing++;
			if (this.timing > this.time) {
				T.stageScene('ready');
			}
			this.play('anim');
			if (this.hdkj.x < 465) {
				this.hdkj.x += 16;
				//console.log('hd');
			}
			if (this.hxgzs.x > 410) {
				this.hxgzs.x -= 19;
				//console.log("hx");
			}
			if (this.timing == 8)this.kcanim.timing = 1;
		}
	});
	//图片需要拼的一小部分
	var Part = T.Sprite.extend({
		ok: false, movetarget: null, rw: null, rh: null, z: 10, ratio_w: 1,
		ratio_h: 1, wh: null, index: null, volume: 0.1, x_yd: 3, movecal: 0,
		init: function (ops) {
			this._super(ops);
			this.oldw = this.w;
			this.oldh = this.h;
			this.oldcx = this.center.x;
			this.oldcy = this.center.y;
			if (this.w > 140) this.ratio_w = 140 / this.w;
			if (this.h > 150) this.ratio_h = 150 / this.h;
			this.w *= this.ratio_w;
			this.center.x *= this.ratio_w;
			this.h *= this.ratio_h;
			this.center.y *= this.ratio_h;
			this.on("down", function (e) {
				if (this.ok) return;
				down_g = true;
				part_g = this;
				this.w = this.oldw;
				this.h = this.oldh;
				this.center.x = this.oldcx;
				this.center.y = this.oldcy;
				this.x = e.pos.x;
				this.y = e.pos.y;
				this.z += 5;
			});
		},
		//向目标移动
		update: function () {
			if (tanchuang && this.movecal < limit_g) {
				this.setOldxy(this.x + 10);
				this.movecal += 10;
			} else if (this.movetarget) {
				var b = this.movetarget;
				this.tx = b.x;
				this.ty = b.y;
				this.z = 3;
				var x_cha = Math.abs(this.x - b.x);
				var y_cha = Math.abs(this.y - b.y);
				var x_yd = this.x_yd;
				var y_yd = x_yd * (y_cha / x_cha);
				if (y_yd > x_yd * 2)y_yd = x_yd * 2;
				if (this.x > b.x + 2) this.x -= x_yd;
				else if (this.x < b.x - 2) this.x += x_yd;
				if (this.y > b.y + 2) this.y -= y_yd;
				else if (this.y < b.y - 2) this.y += y_yd;
				if (Math.abs(this.x - b.x) < 10 && Math.abs(this.y - b.y) < 10) {
					var anim = new AnimPlayer({
						x: this.x,
						y: this.y,
						w: 177,
						h: 474,
						center: {
							x: 88,
							y: 237
						}
					});
					anim.setAnimSheet("sheet_buling", "buling");
					anim.action = function () {
						this.play('anim');
						if (this.timing > this.time) this.parent.remove(this);
						this.timing++;
					};
					this.parent.add(anim);
					this.movetarget = null;
				}
			} else if (this.ok) {
				this.x = this.tx;
				this.y = this.ty;
			}
		},
		setOldxy: function (x, y) {
			this.oldx = x;
			this.x = x;
			if (y != null) {
				this.oldy = y;
				this.y = y;
			}
		}
	});
	//宠物
	var Pet = AnimPlayer.extend({
		time: 30, z: 3, x: 950, y: 100, w: 320, h: 600, randomnum: 0, pet: null,
		init: function (ops) {
			this._super(ops);
			this.randomnum = Math.random() * 2 + 2;
			if (!choose_pet) {
				this.pet = pet_g;
			}
			if (this.pet == null)this.pet = 'lu';
			switch (this.pet) {
				case "laohu":
					this.setAnimSheet("sheet_laohu", "tuzi");
					break;
				case "lu":
					this.setAnimSheet("sheet_kaipian", "kaipian");
					break;
				case "tuzi":
					this.setAnimSheet("sheet_tuzi", "tuzi");
					break;
			}
		},
		action: function () {
			if (this.timing / this.time < this.randomnum) {
				this.play('idle');
			} else if (this.timing / this.time < this.randomnum + 1) {
				this.anim();
			} else if (this.timing / this.time < this.randomnum + 2) {
				this.timing = 0;
			}
			this.timing++;
		}
	});
	//图片，有空白的整张图片,空白处留着拼
	var Picture = T.Sprite.extend({
		x: 500, y: 150, z: 1,
		init: function (ops) {
			this._super(ops);
			picture_c = this;
			switch (level) {
				case 0:
					this.asset = 'mu_blank.png';
					this.w = 372;
					this.h = 381;
					break;
				case 1:
					this.asset = 'shan_blank.png';
					this.w = 282;
					this.h = 273;
					break;
				case 2:
					this.asset = 'ri_blank.png';
					this.w = 226;
					this.h = 258;
					break;
			}
			this.on("added", function () {
				var stage = this.parent;
				var length, data = [];
				length = data_g[level].length;
				data = data_g[level].concat();
				this.parts = [];
				var i, x, y, temp = [];
				for (i = 0; i < data.length; i++) {
					temp[i] = i;
				}
				temp.sort(function (a, b) {
					return Math.random() > 0.5 ? -1 : 1;
				});
				for (i = 0; i < length; i++) { //添加需要拼的数量个拼图
					this.parts.push(data[i]);
					var part = new Part(data[temp[i]]);
					x = 170 * (i % 2) + 100 - limit_g;
					y = 180 * Math.floor(i / 2) + 150;
					part.setOldxy(x, y);
					stage.add(part);
				}
				i = length;//需要添加在图片中的拼图的起点
				for (; i < length; i++) { //不需要拼的全部显示出来
					var qita = new T.Sprite(data[i]);
					qita.z = 2;
					stage.add(qita);
				}
			});
		},
		update: function () {
			//过关检测
			if (this.parts.length == 0 && !addedclear) {
				this.parent.add(new GameClear());
				addedclear = true;
			}
		}
	});

	var Text = T.CText.extend({
		size: 40, width: 400, time: 50, y: 500, color: '#00f',
		init: function (text, ops) {
			this._super(text, ops);
			this.setSize(this.size);
			this.x = (1280 - text.length * this.size) / 2;
			this.maxrow = Math.ceil(text.length * this.size / this.width);
			if (this.maxrow > 1) {
				this.numperrow = this.width / this.size;
				this.texts = [];
				for (var i = 0; i < this.maxrow; i++) {
					this.texts[i] = text.substr(i * this.numperrow, this.numperrow);
				}
			}
		},
		update: function () {
			this.alpha = 1 - 1 / this.time;
			if (this.time < 1)this.parent.remove(this);
			this.time--;
		},
		render: function (ctx) {
			if (!ctx) {
				ctx = this.ctx;
			}
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation * Math.PI / 180);
			ctx.scale(this.scale.x, this.scale.y);
			ctx.globalAlpha = this.alpha;
			ctx.fillStyle = this.color;
			ctx.textAlign = this.align;
			ctx.textbaseline = this.baseline;
			ctx.font = this._rfont;
			if (this.maxrow < 2) ctx.fillText(this._text, 0, 0);
			else {
				for (var i = 0; i < this.maxrow; i++) {
					ctx.fillText(this.texts[i], 0, i * this.size);
				}
			}
			ctx.restore();
			this.emit("render", ctx);
		}
	});
	//字演变原图
	var Ziyuantu = T.Sprite.extend({
		w: 375, h: 500, x: 350, y: 100, z: 2,
		init: function () {
			switch (level) {
				case 0:
					this.asset = 'mu_shu.png';
					break;
				case 1:
					this.asset = 'shan.png';
					break;
				case 2:
					this.asset = 'ri_taiyang.png';
					break;
			}
		},
		update: function () {
			if (duihuaindex == 1 && this.x > 50) {
				this.x -= 15;
			}
		}
	});

	//加载，显示吉祥物
	T.scene("load", new T.Scene(function (stage) {
		stage.add(new OP());
	}, {
		sort: true
	}));
	//待机场景
	T.scene("ready", new T.Scene(function (stage) {
		stage.merge('interactive');
		stage_g = stage;
		if (bgmusic) bgmusic.pause();
		bgmusic = T.getAsset('index.mp3');
		bgmusic.loop = true;
		bgmusic.play();
		var bg = new BG('bg_ready.png');
		stage.add(bg);
		var gs = new Button({asset: 'game_start.png', w: 272, h: 105, x: 504, y: 500});
		stage.add(gs);
		gs.down = function () {
			T.stageScene('xuanzechongwu');
		};
		// var gc = new Button({
		// 	asset: 'game_continue.png',
		// 	w: 272,
		// 	h: 105,
		// 	x: 700,
		// 	y: 500
		// });
		// stage.add(gc);
		// gc.down = function () {
		// 	if (record.level == null) {
		// 		T.stageScene('xuannannv');
		// 	} else {
		// 		T.stageScene('xuanguan');
		// 	}
		// };
	}, {
		sort: true
	}));

	T.scene('xuanguan', new T.Scene(function (stage) {
		stage.merge('interactive');
		stage_g = stage;
		choose_pet = false;
		stage.add(new ChooseLevel());
	}, {
		sort: true
	}));

	var choose_pet = false;
	T.scene('xuanzechongwu', new T.Scene(function (stage) {
		stage.merge('interactive');
		stage_g = stage;
		choose_pet = true;
		stage.add(new T.Sprite({asset: 'xuanzelaohu.png', w: 427, h: 720}));
		stage.add(new T.Sprite({asset: 'xuanzelu.png', w: 427, h: 720, x: 427}));
		stage.add(new T.Sprite({asset: 'xuanzetuzi.png', w: 427, h: 720, x: 854}));
		var laohu = new Pet({pet: 'laohu', w: 300, h: 500, x: 60, y: 180});
		laohu.down = function () {
			pet_g = 'laohu';
			T.stageScene('xuanguan');
		};
		stage.add(laohu);
		var lu = new Pet({pet: "lu", w: 400, h: 600, x: 437, y: 80});
		lu.down = function () {
			pet_g = 'lu';
			T.stageScene('xuanguan');
		};
		stage.add(lu);
		var tuzi = new Pet({pet: 'tuzi', w: 300, h: 550, x: 914, y: 130});
		tuzi.down = function () {
			pet_g = 'tuzi';
			T.stageScene('xuanguan');
		};
		stage.add(tuzi);
		var fanhui = new Back();
		fanhui.down = function () {
			T.stageScene('ready');
		};
		stage.add(fanhui);
	}, {sort: true}));
	//游戏场景
	T.scene("game", new T.Scene(function (stage) {
		if (bgmusic)bgmusic.pause();
		bgmusic = T.getAsset(level + '.mp3');
		bgmusic.loop = true;
		bgmusic.play();
		stage.merge('interactive');
		stage_g = stage;
		down_g = tanchuang = addedclear = clear_g = false;
		downable_g = true;
		targetindex = 1;
		part_g = null;
		duihuaindex = 0;
		stage.add(new BG('bg.png'));
		var fanhui = new Back();
		fanhui.down = function () {
			T.stageScene('ready');
		};
		stage.add(fanhui);
		stage.add(new Baiban());
		stage.add(new Ziyuantu());
		var petbg = new T.Sprite({asset: 'bg_tuzi.png', w: 350, h: 720, x: 930});
		switch (pet_g) {
			case "lu":
				petbg.asset = 'bg_xiaolu.png';
				break;
			case "laohu":
				petbg.asset = 'bg_laohu.png';
				break;
		}
		stage.add(petbg);
		stage.add(new Pet());
	}, {
		sort: true
	}));


	//加载资源
	T.load([
		'heidaokeji.png', 'huoxuangongzuoshi.png', 'kaichang_anim.png', 'kaichang_b.png', 'kaipian.png', 'buling.png', 'bg_tuzi.png', 'bg_laohu.png', 'bg_xiaolu.png', 'anim_tuzi.png', 'anim_laohu.png', 'bg_ready.png', 'game_start.png', 'game_continue.png', 'baiban.png', 'bg.png', 'fanhui.png', 'mu_anim.png', 'mu_shu.png', 'mu_blank.png', 'muheng.png', 'mushu.png', 'mupie.png', 'muna.png', 'clear.png', 'next.png', 'onceagain.png', 'shan.png', 'shan1.png', 'shan2.png', 'shan3.png', 'shan_blank.png', 'shan_anim.png', 'ri_taiyang.png', 'ri1.png', 'ri2.png', 'ri3.png', 'ri4.png', 'ri_anim.png', 'ri_blank.png', 'index.mp3', '1.mp3', '2.mp3', '0.mp3', 'zi0.mp3', 'zi1.mp3', 'zi2.mp3', 'xuanzelaohu.png', 'xuanzelu.png', 'xuanzetuzi.png', 'xuanguan.png', 'xuanguan_ri.png', 'xuanguan_shan.png', 'xuanguan_mu.png'], function () {
		T.sheet("sheet_kaipian", "kaipian.png", {tw: 400, th: 567});
		T.sheet("sheet_kcanim", "kaichang_anim.png", {tw: 1280, th: 720});
		T.sheet("sheet_buling", "buling.png", {tw: 177, th: 474});
		T.sheet("sheet_0", "mu_anim.png", {tw: 372, th: 381});
		T.sheet("sheet_1", "shan_anim.png", {tw: 282, th: 273});
		T.sheet("sheet_2", "ri_anim.png", {tw: 226, th: 258});
		T.sheet("sheet_tuzi", 'anim_tuzi.png', {tw: 315, th: 610});
		T.sheet("sheet_laohu", 'anim_laohu.png', {tw: 315, th: 494});
		_.each([
			["kaipian", {
				anim: {frames: _.range(0, 5), rate: 1 / 3},
				idle: {frames: [0], rate: 1}
			}],
			["kcanim", {
				anim: {frames: _.range(0, 11), rate: 1 / 7},
				ready: {frames: [0], rate: 1},
				idle: {frames: [10], rate: 1}
			}],
			["buling", {anim: {frames: _.range(0, 6), rate: 1 / 5}}],
			["tuzi", {
				anim: {frames: _.range(0, 4), rate: 1 / 4},
				idle: {frames: [0], rate: 1}
			}],
			["sp_0", {anim: {frames: _.range(0, 4), rate: 2}}],
			["sp_1", {anim: {frames: _.range(0, 3), rate: 2}}],
			["sp_2", {anim: {frames: _.range(0, 4), rate: 2}}]
		], function (anim) {
			T.fas(anim[0], anim[1]);
		});
		maxlevel = data_g.length;
		window.setTimeout(function () {
			T.stageScene('load');
		}, 300);
		T.input.on('x', function () {
			T.stageScene('ready');
		});
		T.input.on('enter', function () {
			if (!stage_g.paused) {
				stage_g.pause();
				if (bgmusic)bgmusic.pause();
			}
			else {
				stage_g.unpause();
				if (bgmusic)bgmusic.play();
			}
		});
	});

	//碰撞函数,p传要拼的能移动的那个部分，b传不会动的空白
	function contact(p, b) {
		var px = p.x - ((p.rw || p.w) * 0.4);
		var pxx = p.x + ((p.rw || p.w) * 0.4);
		var py = p.y - ((p.rh || p.h) * 0.4);
		var pyy = p.y + ((p.rh || p.h) * 0.4);
		var bx = b.x - ((b.rw || b.w) * 0.4);
		var bxx = b.x + ((b.rw || b.w) * 0.4);
		var by = b.y - ((b.rh || b.h) * 0.4);
		var byy = b.y + ((b.rh || b.h) * 0.4);
		return !(pxx <= bx || pyy <= by || px >= bxx || py >= byy);
	}

	function deepCopy(source) {
		var result = {};
		for (var key in source) {
			result[key] = typeof source[key] == 'object' ? deepCopy(source[key]) : source[key];
		}
		return result;
	}

	//判断是不是相同的东西，判断碰撞没,p传要拼的能移动的那个部分，b传不会动的空白
	function isThisPart(p, b) {
		if (p.index == b.index && contact(p, b)) {
			if (p.index > targetindex) {
				stage_g.add(new Text("还没到这一步哦！"));
				return false;
			}
			return true;
		}
		return false;
	}

	//判断位置，能否贴上
	function judgePosition(p) {
		var parts = picture_c.parts;
		for (var i = 0; i < parts.length; i++) {
			if (isThisPart(p, parts[i])) {
				p.movetarget = deepCopy(parts[i]);
				p.ok = true;
				picture_c.parts.splice(i, 1); //拼好的就移除
				targetindex++;
				return;
			}
		}
	}

	function setStorage() {
		localStorage.setItem(GAME_NAME, JSON.stringify(record));
	}

	T.cvs.addEventListener("mousemove", movefunc, false);
	T.cvs.addEventListener("touchmove", movefunc, false);
	T.cvs.addEventListener("mouseup", upfunc, false);
	T.cvs.addEventListener("touchend", upfunc, false);
	T.cvs.addEventListener("touchcancel", upfunc, false);
	T.cvs.addEventListener("touchstart", downfunc, false);
	T.cvs.addEventListener("mousedown", downfunc, false);

	var demo_g;

	function downfunc(e) {
		if (!downable_g)return;
		switch (duihuaindex) {
			case 0:
				demo_g = new Demonstrate();
				stage_g.add(demo_g);
				stage_g.add(new OnceMore());
				break;
			case 1:
				demo_g.z = -1;
				stage_g.add(new Picture());
				stage_g.add(new Baiban());
				tanchuang = true;
				break;
		}
		//downable_g = false;
		duihuaindex++;
		e.stopPropagation();
		e.preventDefault();
	}

	function movefunc(e) {
		if (!down_g || part_g == null || part_g.ok) return;
		var point = getPoint(e);
		part_g.x = point.x;
		part_g.y = point.y;
		e.stopPropagation();
		e.preventDefault();
	}

	function upfunc(e) {
		if (clear_g || part_g == null) return;
		judgePosition(part_g);
		if (part_g.ok) {
			down_g = false;
			part_g = null;
			return;
		}
		part_g.x = part_g.oldx;
		part_g.y = part_g.oldy;
		part_g.w *= part_g.ratio_w;
		part_g.h *= part_g.ratio_h;
		part_g.center.x *= part_g.ratio_w;
		part_g.center.y *= part_g.ratio_h;
		part_g.z -= 5;
		down_g = false;
		part_g = null;
		e.stopPropagation();
		e.preventDefault();
	}

	function getPoint(e) {
		var element = T.cvs;
		var point = {
			x: (e.pageX || e.clientX + document.body.scrollLeft) - element.offsetLeft - T.canvas_tran_x,
			y: (e.pageY || e.clientY + document.body.scrollTop) - element.offsetTop - T.canvas_tran_y
		};

		if (T.scale) {
			point.x /= T.scale.x;
			point.y /= T.scale.y;
		}
		return point;
	}
};

Tina.Scenes = function (T) {
    T.scenes = {};
    T.stages = [];

    T.Scene = Class.extend({
        init: function (sceneFunc, ops) {
            this.ops = ops || {};
            this.sceneFunc = sceneFunc;
        }
    });

    // set up  or return a new scene
    T.scene = function (name, sceneObj) {
        if (sceneObj) {
            T.scenes[name] = sceneObj;
        }
        return T.scenes[name];
    };

    T.overlap = function (o1, o2) {
        return !((o1.y + o1.h - 1 < o2.y) || (o1.y > o2.y + o2.h - 1) ||
        (o1.x + o1.w - 1 < o2.x) || (o1.x > o2.x + o2.w - 1));
    };

    T.Stage = T.GameObject.extend({
        defaults: {
            sort: false
        },
        init: function (scene) {
            this.scene = scene;
            this.items = [];
            this.index = {};
            this.removeList = [];
            if (scene) {
                this.options = _.clone(this.defaults);
                _.extend(this.options, scene.ops);
                scene.sceneFunc(this);
            }
            if (this.options.sort && !_.isFunction(this.options.sort)) {
                this.options.sort = function (a, b) {
                    return a.z - b.z;
                };
            }
        },

        each: function (callback) {
            for (var i = 0, len = this.items.length; i < len; ++i) {
                callback.call(this.items[i], arguments[1], arguments[2]);
            }
        },

        eachInvoke: function (funcName) {
            for (var i = 0, len = this.items.length; i < len; ++i) {
                if (this.items[i][funcName]) {
                    this.items[i][funcName].call(
                        this.items[i], arguments[1], arguments[2]
                    );
                }
            }
        },

        detect: function (func) {
            for (var i = 0, val = null, len = this.items.length; i < len; ++i) {
                if (func.call(this.items[i], arguments[1], arguments[2])) {
                    return this.items[i];
                }
            }
            return false;
        },

        add: function (itm) {
            this.items.push(itm);
            itm.parent = this;
            if (itm.id) {
                this.index[itm.id] = itm;
            }
            this.emit("add", itm);
            itm.emit("added", this);
            return itm;
        },

        remove: function (itm) {
            this.removeList.push(itm);
        },

        forceRemove: function (itm) {
            var idx = this.items.indexOf(itm);
            if (idx != -1) {
                this.items.splice(idx, 1);
                if (itm.destroy) itm.destroy();
                if (itm.p && itm.id)
                    delete this.index[itm.id];
                this.emit("removed", itm);
            }
        },
        removeAll: function () {
            for (var i = 0, len = this.items.length; i < len; ++i)
                this.forceRemove(this.items[i]);
            this.items.length = 0;
        },
        pause: function () {
            this.paused = true;
        },

        unpause: function () {
            this.paused = false;
        },

        _hitTest: function (obj, type) {
            if (obj != this) {
                var col = (!type || this.type & type) && T.overlap(obj, this);
                return col ? this : false;
            }
            return null;
        },

        collide: function (obj, type) {
            return this.detect(this._hitTest, obj, type);
        },

        update: function (dt) {
            if (this.paused) return;
            this.emit("preupdate", dt);
            this.eachInvoke("update", dt);
            this.emit("update", dt);

            if (this.removeList.length > 0) {
                for (var i = 0, len = this.removeList.length; i < len; ++i)
                    this.forceRemove(this.removeList[i]);
                this.removeList.length = 0;
            }
        },

        render: function (ctx) {
            if (this.options.sort)
                this.items.sort(this.options.sort);
            ctx.save();
            if (T.scale)
                ctx.scale(T.scale.x, T.scale.y);
            this.emit("prerender", ctx);
            this.eachInvoke("render", ctx);
            this.emit("render", ctx);
            ctx.restore();
        }
    });

    T.activeStage = 0;

    T.stage = function (num) {
        num = (num === void 0) ? T.activeStage : num;
        return T.stages[num];
    };

    T.stageScene = function (scene, num, stageClass) {
        stageClass = stageClass || T.Stage;
        if (_.isString(scene)) {
            scene = T.scene(scene);
        }

        num = num || 0;

        if (T.stages[num]) {
            T.stages[num].removeAll();
            T.stages[num].destroy();
            T.stages[num] = null;
        }


        T.stages[num] = new stageClass(scene);

        if (!T.loop)
            T.gameLoop(T.stageGameLoop);
    };

    T.stageGameLoop = function (dt) {
        if (T.ctx) T.clear("#777");

        for (var i = 0, len = T.stages.length; i < len; ++i) {
            T.activeStage = i;
            var stage = T.stage();
            if (stage) {
                stage.update(dt);
                stage.render(T.ctx);
            }
        }
        T.activeStage = 0;
        // if(T.input && T.ctx) T.input.drawCanvas(T.ctx);
    };

    T.clearStage = function (num) {
        if (T.stages[num]) {
            T.stages[num].removeAll();
            T.stages[num].destroy();
            T.stages[num] = null;
        }
    };

    T.clearStages = function () {
        for (var i = 0, len = T.stages.length; i < len; ++i) {
            if (T.stages[i]) {
                T.stages[i].destroy();
                T.stages[i] = null;
            }
        }
        T.stages.length = 0;
    };

    T.c("interactive", {
        merged: function () {
            // this.items = this.entity.items;
            if (T.cvs) {
                var events = ["mousedown", "mouseup", "mousemove"];
                if (T.touchDevice)
                    events = ["touchstart", "touchend", "touchmove", "touchcancel"];
                _.each(events, function (evt) {
                    T.cvs.addEventListener(evt, this.inputDispatchHandler.bind(this), false);
                }, this);
            }
        },
        extend: {
            containsPoint: function (item, point) {
                return this.interactive.containsPoint(item, point);
            }
        },
        inputDispatchHandler: function (e) {
            var point = null;
            var event = "null";
            if (e.type == "mousedown") {
                event = "down";
                point = this.getInputPoint(e, T.cvs);
            } else if (e.type == "mouseup") {
                event = "up";
                point = this.getInputPoint(e, T.cvs);
            } else if (e.type == "mousemove") {
                event = "move";
                point = this.getInputPoint(e, T.cvs);
            } else if (e.type == "touchstart") {
                event = "down";
                point = this.getInputPoint(e.targetTouches[0], T.cvs);
            } else if (e.type == "touchend" || e.type == "touchcancel") {
                event = "up";
                point = this.getInputPoint(e.changedTouches[0], T.cvs);
            } else if (e.type == "touchmove") {
                event = "move";
                point = this.getInputPoint(e.targetTouches[0], T.cvs);
            }

            if (point) {
                // var items = this.getItemsAt(point.x,point.y);
                // _.each(this.items,function(item){
                //   if(this.containsPoint(item, point)) {
                //     item.trigger(event,{type:event,target:item,pos:point});
                //   }
                // },this);
                var items = this.base.items;
                for (var i = items.length - 1; i >= 0; --i) {
                    var item = items[i];
                    if (item.hasListener(event)) {
                        if (this.containsPoint(item, point)) {
                            item.emit(event, {type: event, target: item, pos: point});
                            break;
                        }
                    }
                }
            }
            // console.log(e);
            e.stopPropagation();
            e.preventDefault();
        },
        getItemsAt: function (x, y) {
            return _.filter(this.base.items, function (item) {
                return this.containsPoint(item, {x: x, y: y}) ? item : null;
            }, this);
        },
        containsPoint: function (item, point) {
            var x = point.x, y = point.y;
            return x >= item.x - item.center.x && x < item.x + item.w - item.center.x &&
                y >= item.y - item.center.y && y < item.y + item.h - item.center.y;
        },
        getInputPoint: function (e, element) {
            var point = {
                x: (e.pageX || e.clientX + document.body.scrollLeft) - element.offsetLeft-T.canvas_tran_x,
                y: (e.pageY || e.clientY + document.body.scrollTop) - element.offsetTop-T.canvas_tran_y
            };

            if (T.scale) {
                point.x /= T.scale.x;
                point.y /= T.scale.y;
            }
            // console.log("point.x"+point.x);
            return point;
        }
    });
};

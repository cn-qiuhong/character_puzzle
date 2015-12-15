Tina.Entities = function(T) {

  T.Entity = T.Sprite.extend({

    size: {x:16, y:16},

    vel: {x:0,y:0},
    accel: {x:0,y:0},
    maxVel: {x:100,y:100},

    init: function(ops) {
      this._super(ops);
    },
    setAnimSheet: function(sheet,sprite) {
      if(sheet) this.sheet = sheet;
      if(sprite) this.sprite = sprite;
      if((!this.w || !this.h)) {
        if(this.getSheet()) {
          this.w = this.w || this.getSheet().tw;
          this.h = this.h || this.getSheet().th;
        }
      }
    }
  });
};

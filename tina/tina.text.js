Tina.Text = function(T) {

  T.CText = T.GameObject.extend({
    _text:'',
    _font:'Verdana',
    _size:16,
    _rfont:'16px Verdana',
    color:'#fff',
    rotation:0,
    scale:{x:1,y:1},
    center: {x:0,y:0},
    alpha:1,
    x:0,
    y:0,
    z:0,
    w:0,
    h:0,
    align:'start',
    baseline:'top',
    ctx:T.ctx,
    init: function(text,ops) {
      _.extend(this,ops);
      this._text = text || '';
      this.ctx = this.ctx || T.ctx;
      this.ctx.font = ''+this.size+'px '+this.font;
      this.id = this.id || _.uniqueId();
      // this.w = this.getWidth(); 
      // this.h = this.getHeight(); 
    },
    setText: function(text) {
      text = text || '';
      this._text = text;
      // this.w = this.getWidth(); 
      // this.h = this.getHeight(); 
    },
    setFont: function(font) {
      this._font = font;
      this._rfont = ''+this._size+'px '+this._font;
    },
    setSize: function(size) {
      this._size = size;
      this._rfont = ''+this._size+'px '+this._font;
    },
    getWidth: function() {
      if(!T.ctx) return 0;
      return T.ctx.measureText(this._text).width*this._text.length;
    },
    getHeight: function() {
      if(!T.ctx) return 0;
      return T.ctx.measureText(this._text).height;
    },
    render: function(ctx) {
      if(!ctx){ ctx = this.ctx; }

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation*Math.PI/180);
      ctx.scale(this.scale.x,this.scale.y);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.textAlign = this.align;
      ctx.textBaseline = this.baseline;
      ctx.font = this._rfont;
      // ctx.fillText(this._text,this.x,this.y);
      // ctx.fillText(this._text,0,0,this.w);
      ctx.fillText(this._text,0,0);
      ctx.restore();
      this.emit("render",ctx);
    }
  });
};

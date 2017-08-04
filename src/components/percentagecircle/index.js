
let defaultOptions = {borderWidth: 2, shadowColor: '#b4c7e7', color: '#4472c4', radius: 30, percent: 0.5};

var Circle = function(canvasId, options={}){
  this.context = wx.createCanvasContext(canvasId);
  this.options = Object.assign({}, defaultOptions, options);
  var that = this;

  for(var i in this.options){
    Object.defineProperty(this, i, {
      set: function (newValue) {
        if( this.options[i] !== newValue ) {
          this.options[i] = newValue;
          that.render();
        }
      }
    });
  }

  this.render();
}

Circle.prototype = {
  render(){
    var context = this.context;
    var options = this.options;
    var borderWidth = options.borderWidth;
    var radius = options.radius;
    var width = radius*2 + borderWidth;
    var height = width

    context.clearRect(0, 0, width, height);

    context.setLineWidth(borderWidth);

    context.beginPath();
    context.setStrokeStyle(options.shadowColor);
    context.arc(radius + borderWidth/2, radius + borderWidth/2, radius, 0, 2 * Math.PI, false)
    context.stroke();

    context.save();
    context.beginPath();
    context.setStrokeStyle(options.color);
    context.translate(width/2, height/2);
    context.rotate(-90 * Math.PI / 180);
    context.arc(radius + borderWidth/2, radius + borderWidth/2, radius, 0, 2 * Math.PI*options.percent, false);
    context.translate(-width/2, -height/2);
    context.stroke();
    context.restore();

    context.draw();
  }
};

module.exports = Circle;
import $ from 'jquery';

$(function () {
  var $canvas = $('#canvas');
  var canvas = $canvas[0];
  var context = canvas.getContext('2d');

  var resizeCanvas = () => {
    canvas.width = $(window).width();
    canvas.height = $(window).height();
  };
  resizeCanvas();
  $(window).on('resize', resizeCanvas);

  var dragging = false;
  var getLoc = (e) => {
    var x = e.x || e.clientX;
    var y = e.y || e.clientY;
    return { x, y };
  };

  var drawStart = (loc) => {
    context.beginPath();
    context.moveTo(loc.x, loc.y);
  };

  var drawMove = (loc) => {
    context.lineTo(loc.x, loc.y);
    context.stroke();
  };

  var drawEnd = (loc) => {
    context.lineTo(loc.x, loc.y);
    context.stroke();
    context.closePath();
  };

  $canvas.on({
    mousedown: function (e) {
      e.preventDefault();
      dragging = true;
      let loc = getLoc(e);
      drawStart(loc);
    },
    mousemove: function (e) {
      e.preventDefault();
      if (dragging) {
        let loc = getLoc(e);
        drawMove(loc);
      }
    },
    mouseup: function (e) {
      e.preventDefault();
      dragging = false;
      let loc = getLoc(e);
      drawEnd(loc);
    }
  });

});

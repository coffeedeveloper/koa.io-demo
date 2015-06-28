import Qs from 'qs';
import cup from 'cupjs';

$(function () {
  var socket = io();
  var roomName = cup.guid(true);

  const querystring = location.search && location.search.substr(1);
  var urlParams = {};

  if (querystring) {
    urlParams = Qs.parse(querystring);
    console.log(urlParams);
    if (urlParams.roomName) {
      roomName = urlParams.roomName;
    }
  }

  console.log(roomName);
  socket.emit('join', roomName);


  /*canvas*/
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

  if (cup.is.mobile()) {
    $('#qrcode').remove();
    var lastLoc = {};
    $canvas.on({
      touchstart: function (e) {
        e.preventDefault();
        var touches = e.originalEvent.touches;
        var loc = {
          x: touches[0].pageX,
          y: touches[0].pageY
        };
        drawStart(loc);
      },
      touchmove: function (e) {
        e.preventDefault();
        var touches = e.originalEvent.touches;
        var loc = {
          x: touches[0].pageX,
          y: touches[0].pageY
        };
        lastLoc = loc;
        drawMove(loc);
      },
      touchend: function (e) {
        e.preventDefault();
        drawEnd(lastLoc);
      }
    });
  } else {
    socket.on('joined', function (msg) {
      $('#qrcode').hide();
    });

    var qrurl = `${location.protocol}//${location.host}${location.pathname}?roomName=${roomName}`;
    console.log(qrurl);
    $('#qrcode').qrcode({
      text: qrurl,
      size: 200
    });

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
  }
});

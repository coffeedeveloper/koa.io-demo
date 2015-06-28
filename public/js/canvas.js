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

  var drawSurfaceData;

  var saveSurface = () => {
    drawSurfaceData = context.getImageData(0, 0, canvas.width, canvas.height);
  };

  var restoreSurface = () => {
    context.putImageData(drawSurfaceData, 0, 0);
  };

  var clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveSurface();
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

    $('#btn-clear').on('click', function () {
      clearCanvas();
      socket.emit('order', roomName, {type: 'clear'});
    });

    var lastLoc = {};
    $canvas.on({
      touchstart: function (e) {
        e.preventDefault();
        var touches = e.originalEvent.touches;
        var loc = {
          x: touches[0].pageX,
          y: touches[0].pageY
        };
        saveSurface();
        drawStart(loc);
        socket.emit('order', roomName, {type: 'start', loc});
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
        socket.emit('order', roomName, {type: 'move', loc});
      },
      touchend: function (e) {
        e.preventDefault();
        restoreSurface();
        drawEnd(lastLoc);
        socket.emit('order', roomName, {type: 'end', loc: lastLoc});
      }
    });
  } else {
    $('#btn-clear').remove();
    socket.on('joined', function (msg) {
      $('#qrcode').hide();
    });

    var qrurl = `${location.protocol}//${location.host}${location.pathname}?roomName=${roomName}`;
    console.log(qrurl);
    $('#qrcode').qrcode({
      text: qrurl,
      size: 200
    });

    socket.on('order', (ord) => {
      console.log(ord);
      switch (ord.type) {
        case 'start':
          saveSurface();
          drawStart(ord.loc);
          break;
        case 'move':
          drawMove(ord.loc);
          break;
        case 'end':
          restoreSurface();
          drawEnd(ord.loc);
          break;
        case 'clear':
          clearCanvas();
          break;
      }
    });

    $canvas.on({
      mousedown: function (e) {
        e.preventDefault();
        dragging = true;
        saveSurface();
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
        restoreSurface();
        let loc = getLoc(e);
        drawEnd(loc);
      }
    });
  }
});

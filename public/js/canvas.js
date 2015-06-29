import Qs from 'qs';
import cup from 'cupjs';

$(function () {
  var socket = io();
  var roomName = cup.guid(true);
  var direction = '';

  const querystring = location.search && location.search.substr(1);
  var urlParams = {};

  if (querystring) {
    urlParams = Qs.parse(querystring);
    console.log(urlParams);
    if (urlParams.roomName) {
      roomName = urlParams.roomName;
    }
    if (urlParams.direction) {
      direction = urlParams.direction;
    }
  }

  console.log(roomName);
  socket.emit('join', roomName, direction);


  /*canvas*/
  var canvasObj = {
    center: {
      $canvas: $('#canvas-center'),
      canvas: $('#canvas-center')[0],
      context: $('#canvas-center')[0].getContext('2d'),
      data: ''
    },
    left: {
      $canvas: $('#canvas-left'),
      canvas: $('#canvas-left')[0],
      context: $('#canvas-left')[0].getContext('2d'),
      data: ''
    },
    right: {
      $canvas: $('#canvas-right'),
      canvas: $('#canvas-right')[0],
      context: $('#canvas-right')[0].getContext('2d'),
      data: ''
    }
  };

  var resizeCanvas = () => {
    canvasObj.left.canvas.width = canvasObj.left.$canvas.parent().width();
    canvasObj.left.canvas.height = canvasObj.left.$canvas.parent().height();

    canvasObj.right.canvas.width = canvasObj.right.$canvas.parent().width();
    canvasObj.right.canvas.height = canvasObj.right.$canvas.parent().height();

    canvasObj.center.canvas.width = canvasObj.center.$canvas.parent().width();
    canvasObj.center.canvas.height = canvasObj.center.$canvas.parent().height();
  };
  resizeCanvas();

  $(window).on('resize', resizeCanvas);

  var dragging = false;
  var getLoc = (e) => {
    var x = e.x || e.clientX;
    var y = e.y || e.clientY;
    return { x, y };
  };


  var saveSurface = (dir) => {
    canvasObj[dir].data = canvasObj[dir].context.getImageData(0, 0,
      canvasObj[dir].canvas.width, canvasObj[dir].canvas.height);
  };

  var restoreSurface = (dir) => {
    canvasObj[dir].context.putImageData(canvasObj[dir].data, 0, 0);
  };

  var clearCanvas = (dir) => {
    canvasObj[dir].context.clearRect(0, 0,
      canvasObj[dir].canvas.width, canvasObj[dir].canvas.height);
    saveSurface(dir);
  };

  var drawStart = (dir, loc) => {
    var c = canvasObj[dir].context;
    c.beginPath();
    c.moveTo(loc.x, loc.y);
  };

  var drawMove = (dir, loc) => {
    var c = canvasObj[dir].context;
    c.lineTo(loc.x, loc.y);
    c.stroke();
  };

  var drawEnd = (dir, loc) => {
    var c = canvasObj[dir].context;
    c.lineTo(loc.x, loc.y);
    c.stroke();
    c.closePath();
  };


  if (cup.is.mobile()) {
    $('#qrcode-left').remove();
    $('#qrcode-right').remove();
    $('#app > .left, #app > .right').hide();
    $('#app > .center').show();
    resizeCanvas();

    $('#btn-clear').show().on('click', function () {
      clearCanvas('center');
      socket.emit('order', roomName, {
        type: 'clear',
        direction: direction
      });
    });

    var lastLoc = {};
    canvasObj.center.$canvas.on({
      touchstart: function (e) {
        e.preventDefault();
        var touches = e.originalEvent.touches;
        var loc = {
          x: touches[0].pageX,
          y: touches[0].pageY
        };

        saveSurface('center');
        drawStart('center', loc);
        socket.emit('order', roomName, {
          type: 'start',
          loc: loc,
          direction: direction
        });
      },
      touchmove: function (e) {
        e.preventDefault();
        var touches = e.originalEvent.touches;
        var loc = {
          x: touches[0].pageX,
          y: touches[0].pageY
        };
        lastLoc = loc;
        drawMove('center', loc);
        socket.emit('order', roomName, {
          type: 'move',
          loc: loc,
          direction: direction
        });
      },
      touchend: function (e) {
        e.preventDefault();
        restoreSurface('center');
        drawEnd('center', lastLoc);
        socket.emit('order', roomName, {
          type: 'end',
          loc: lastLoc,
          direction: direction
        });
      }
    });
  } else {
    socket.on('joined', function (dir) {
      $('#qrcode-' + dir).hide();
    });

    var qrurl = `${location.protocol}//${location.host}${location.pathname}?roomName=${roomName}`;

    var qrurlLeft = `${qrurl}&direction=left`;
    var qrurlRight = `${qrurl}&direction=right`;

    console.log(qrurlLeft);
    console.log(qrurlRight);

    $('#qrcode-left').qrcode({
      text: qrurlLeft,
      size: 200
    });

    $('#qrcode-right').qrcode({
      text: qrurlRight,
      size: 200
    });

    socket.on('order', (ord) => {
      console.log(ord);
      switch (ord.type) {
        case 'start':
          saveSurface(ord.direction);
          drawStart(ord.direction, ord.loc);
          break;
        case 'move':
          drawMove(ord.direction, ord.loc);
          break;
        case 'end':
          restoreSurface(ord.direction);
          drawEnd(ord.direction, ord.loc);
          break;
        case 'clear':
          clearCanvas(ord.direction);
          break;
      }
    });

    /*
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
    */
  }
});

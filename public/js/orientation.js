import Qs from 'qs';
import cup from 'cupjs';

$(function() {

  var roomName = cup.guid(true);

  console.log(roomName);

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

  var socket = io();

  socket.emit('join', roomName);
  var $log = $('#log');
  var $sys = $log.find('.sys');
  var $info = $log.find('.info');
  var $ball = $('.ball');

  var win = {
    x: $(window).width(),
    y: $(window).height()
  };

  var isdebug = false;
  if (isdebug) {
    $sys.html(`
      window width: ${win.x}<br />
      window height: ${win.y}
    `);
  }

  var move = (e) => {
    var lr = e.gamma < 0 ? 'left' : 'right';
    var fb = e.beta < 0 ? 'front' : 'back';

    var pfb = Math.abs(e.beta) / 45;
    if (pfb > 1) pfb = 1;

    var plr = Math.abs(e.gamma) / 45;
    if (plr > 1) plr = 1;

    var maxx = (win.x * 0.5) - 40;
    var maxy = (win.y * 0.5) - 40;

    var x = (maxx * plr) * (lr == 'left' ? -1 : 1);
    var y = (maxy * pfb) * (fb == 'front' ? -1 : 1);

    var prop = 'translate(' + x + 'px, ' + y + 'px)';
    console.log(prop);
    return prop;
  };


  if (cup.is.mobile()) {
    $('#mask').hide();

    var orders = [];

    if (window.DeviceOrientationEvent) {
      $(window).on('deviceorientation', function(event) {
        var e = event.originalEvent;

        if (isdebug) {
          $info.html(`
            gamma: ${e.gamma}<br />
            beta: ${e.beta}<br />
            alpha: ${e.alpha}
          `);
        }

        var o = {
          gamma: e.gamma,
          beta: e.beta,
          alpha: e.alpha,
          date: new Date()
        };

        $ball.css('transform', move(o));
        orders.push(o);
      });
    }

    setInterval(() => {
      var o = orders.shift();
      if (o) {
        socket.emit('order', roomName, o);
      }
    }, 20);
  } else {
    socket.on('joined', function(msg) {
      $('#mask').fadeOut();
    });

    var qrurl = `${location.protocol}//${location.host}${location.pathname}?roomName=${roomName}`;
    console.log(qrurl);
    $('#qrcode').qrcode({
      text: qrurl,
      size: 200
    });

    var lastDate = null;
    socket.on('order', (e) => {
      if (lastDate === null) {
        lastDate = e;
      }

      if (e.date >= lastDate) {
        requestAnimationFrame(() => {
          $ball.css('transform', move(e));
        });
      }

      lastDate = e.date;
    });
  }
});

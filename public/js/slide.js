import Qs from 'qs';
import cup from 'cupjs';

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


if (cup.is.mobile()) {
  $('#impress').hide();
  var points = {
    start: {},
    end: {}
  };
  $(document).on({
    touchstart: function (e) {
      var touches = e.originalEvent.touches;
      points.start = {
        x: touches[0].pageX,
        y: touches[0].pageY
      };
    },
    touchmove: function (e) {
      e.preventDefault();
      var touches = e.originalEvent.touches;
      points.end = {
        x: touches[0].pageX,
        y: touches[0].pageY
      };
    },
    touchend: function (e) {
      var dir = points.end.x > points.start.x ? 'right' : 'left';
      socket.emit('order', roomName, dir);
    }
  });

  var steps = [];
  $('#impress .step').each(function (i) {
    var id = $(this).attr('id') || 'step-' + (i+1);
    steps.push({
      id: id,
      html: $(this).html()
    });
  });


  var $preview = $('<div id="preview-slide"></div>');
  $('body').append($preview);

  $preview.html(steps[1].html);

  socket.on('order', (hash) => {
    for (var i = 0; i < steps.length; i++) {
      var item = steps[i];
      if (item.id == hash) {
        if (i + 1 == steps.length) {
          $preview.html('已经播完了');
        } else {
          $preview.html(steps[i+1].html);
        }
      }
    }
  });

} else {

  $(window).on('hashchange', function (e) {
    socket.emit('order', roomName, window.location.hash.replace('#/', ''));
  });

  var slide = impress();
  slide.init();
  socket.on('joined', function (msg) {
    $('#mask').fadeOut();
  });

  var qrurl = `${location.protocol}//${location.host}${location.pathname}?roomName=${roomName}`;
  console.log(qrurl);
  $('#qrcode').qrcode({
    text: qrurl,
    size: 200
  });

  socket.on('order', function (dir) {
    if (dir == 'right') {
      slide.prev();
    } else {
      slide.next();
    }
  });
}

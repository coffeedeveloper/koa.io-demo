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
  if (urlParams.guid) {

  }
} else {
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
    if (dir == 'left') {
      slide.prev();
    } else {
      slide.next();
    }
  });
}

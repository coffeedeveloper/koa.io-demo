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

var $output = $('#output');
var $app = $('#app');

var socket = io();

socket.emit('join', roomName);


if (cup.is.mobile()) {
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

  socket.on('joined', function (msg) {
    $('#qrcode').hide();
    for (var i = 0; i < 100; i++) {
      $app.append(`<div data-i="${i}" class="slide z${100-i}">${i}</div>`);
    }
  });

  var qrurl = location.protocol + '//' + location.host + '?roomName=' + roomName;
  console.log(qrurl);
  $('#qrcode').qrcode({
    text: qrurl,
    size: 200
  });

  var current = 0;

  socket.on('order', function (dir) {
    console.log('in order');
    console.log(dir);
    $(`.slide[data-i="${current}"]`).addClass(dir);
    current++;
  });
}

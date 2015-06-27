var staticCache = require('koa-static-cache');
var path = require('path');
var fs = require('fs');
var koa = require('koa.io');

var port = process.env.PORT || 3030;

var app = koa();

app.use(staticCache(path.join(__dirname, 'public')));

app.use(function* () {
  this.body = fs.createReadStream(path.join(__dirname, 'public/index.html'));
  this.type = 'html';
});

app.io.use(function* (next) {
  console.log('somebody connected');
  console.log(this.id);
  //console.log(this.headers);
  yield* next;
  console.log('somebody disconnected');
  console.log(this.id);
});

app.io.route('join', function* (next, room) {
  console.log(room);
  this.join(room);
  this.to(room).emit('joined', `${this.id} has join the room:${room}`);
});

app.io.route('leave', function* (next, room) {
  this.leave(room);
});

app.io.route('order', function* (next, room, dir) {
  console.log(room, dir);
  this.to(room).emit('order', dir);
});

app.listen(port, function () {
  console.log('Server listening at port %d', port);
});

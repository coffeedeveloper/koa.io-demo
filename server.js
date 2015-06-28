var staticCache = require('koa-static-cache');
var path = require('path');
var fs = require('fs');
var koa = require('koa.io');
var router = require('koa-router')();

var port = process.env.PORT || 3030;

var app = koa();

router
  .get('/', function *(next) {
    this.body = fs.createReadStream(path.join(__dirname, 'public/slide.html'));
    this.type = 'html';
  })
  .get('/canvas', function *(next) {
    this.body = fs.createReadStream(path.join(__dirname, 'public/canvas.html'));
    this.type = 'html';
  });

app.use(staticCache(path.join(__dirname, 'public')));

app.use(router.routes())
    .use(router.allowedMethods());

app.io.use(function *(next) {
  console.log('somebody connected', this.id);
  yield* next;
  console.log('somebody disconnected', this.id);
});

app.io.route('join', function *(next, room) {
  this.join(room);
  this.to(room).emit('joined', `${this.id} has join the room:${room}`);
});

app.io.route('leave', function *(next, room) {
  this.leave(room);
});

app.io.route('order', function *(next, room, order) {
  this.to(room).emit('order', order);
});

app.listen(port, function () {
  console.log('Server listening at port %d', port);
});

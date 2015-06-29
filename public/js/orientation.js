$(function() {
  var $log = $('#log');
  var $sys = $log.find('.sys');
  var $info = $log.find('.info');
  var $ball = $('.ball');

  var win = {
    x: $(window).width(),
    y: $(window).height()
  };

  $sys.html(`
    window width: ${win.x}<br />
    window height: ${win.y}
  `);

  if (window.DeviceOrientationEvent) {
    $(window).on('deviceorientation', function(event) {
      var e = event.originalEvent;
      $info.html(`
        gamma: ${e.gamma}<br />
        beta: ${e.beta}<br />
        alpha: ${e.alpha}
      `);

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

      $ball.css('transform', prop);

    });
  }
});

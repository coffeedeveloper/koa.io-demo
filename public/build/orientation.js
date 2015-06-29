/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	$(function () {
	  var $log = $('#log');
	  var $sys = $log.find('.sys');
	  var $info = $log.find('.info');
	  var $ball = $('.ball');
	
	  var win = {
	    x: $(window).width(),
	    y: $(window).height()
	  };
	
	  $sys.html('\n    window width: ' + win.x + '<br />\n    window height: ' + win.y + '\n  ');
	
	  if (window.DeviceOrientationEvent) {
	    $(window).on('deviceorientation', function (event) {
	      var e = event.originalEvent;
	      $info.html('\n        gamma: ' + e.gamma + '<br />\n        beta: ' + e.beta + '<br />\n        alpha: ' + e.alpha + '\n      ');
	
	      var lr = e.gamma < 0 ? 'left' : 'right';
	      var fb = e.beta < 0 ? 'front' : 'back';
	
	      var pfb = Math.abs(e.beta) / 45;
	      if (pfb > 1) pfb = 1;
	
	      var plr = Math.abs(e.gamma) / 45;
	      if (plr > 1) plr = 1;
	
	      var maxx = win.x * 0.5 - 40;
	      var maxy = win.y * 0.5 - 40;
	
	      var x = maxx * plr * (lr == 'left' ? -1 : 1);
	      var y = maxy * pfb * (fb == 'front' ? -1 : 1);
	
	      var prop = 'translate(' + x + 'px, ' + y + 'px)';
	      console.log(prop);
	
	      $ball.css('transform', prop);
	    });
	  }
	});

/***/ }
/******/ ]);
//# sourceMappingURL=orientation.js.map
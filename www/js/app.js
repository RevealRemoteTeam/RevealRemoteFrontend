angular.module('RevealRemote', ['ionic'])

.controller('ControlsController', ['$scope', 'socket.io', function ($scope, socket) {
    $scope.onTouchpadSwipe = _emitControl.bind(null);
    $scope.toggleOverview = _emitControl.bind(null, 'toggleOverview');
    $scope.togglePause = _emitControl.bind(null, 'togglePause');

    function _emitControl (action) {
      socket.emit('control', {
        action: action
      });
    };
}])

.controller('LoginController', ['$scope', 'socket.io', function ($scope, socket) {
  $scope.onSignInClick = function () {
    socket.emit('handshake', {
      nickname: this.nickname,
      magic: this.magic
    });
  };
}])

.factory('socket.io', ['ViewSelector', function(viewSelector) {
  var socket = io.connect('127.0.0.1:8101');
  socket.on('ok', function () {
    viewSelector.controls();
  });
  socket.on('not ok', function () {
    // notification using toastr or smth
    viewSelector.signIn();
  });
  return socket;
}])

.factory('ViewSelector', function () {
  return {
    signIn: function () {
      document.querySelector('[data-view="sign-in"]').classList.remove('hidden');
      document.querySelector('[data-view="controls"]').classList.add('hidden');
    },
    controls: function () {
      document.querySelector('[data-view="controls"]').classList.remove('hidden');
      document.querySelector('[data-view="sign-in"]').classList.add('hidden');
    }
  }
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    !screen.lockOrientation || screen.lockOrientation('portrait');

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }


  });
})
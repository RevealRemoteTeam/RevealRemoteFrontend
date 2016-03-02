angular.module('RevealRemote', ['ionic'])

.controller('ControlsController', ['$scope', 'socket.io', function ($scope, socket) {
	var gauge = new Gauge(document.getElementById('progress')).setOptions({
		lines: 12,
		angle: 0,
		lineWidth: 0.27,
		pointer: {
			length: 0.9,
			strokeWidth: 0.035,
			color: '#000000'
		},
		limitMax: true,
		colorStart: '#6FADCF',
		colorStop: '#8FC0DA',
		strokeColor: '#E0E0E0',
		generateGradient: true
	});
	gauge.maxValue = 100;
	gauge.set(0);

	socket.on('slide changed', function (data) {
		$scope.$apply(function () {
			gauge.set(data.progress * 100);
			$scope.slideNotes = data.slideNotes;
		});
	});

	$scope.emitControl = function (action) {
		socket.emit('control', {
			action: action
		});
	};
}])

.controller('LoginController', ['$scope', 'socket.io', function ($scope, socket) {
	$scope.onSignInClick = function () {
		socket.emit('handshake', {
			nickname: $scope.nickname,
			magic: $scope.magic
		});
	};
}])

.controller('StatusLedController', ['$scope', 'socket.io', function ($scope, socket) {
	$scope.statusLedClass = ({ closed: 'mediocre', opening: 'connecting', open: 'good' })[socket.io.readyState];
	socket.on('reconnecting', _setClass.bind(null, 'connecting'));
	socket.on('reconnect_failed', _setClass.bind(null, 'bad'));
	socket.on('connect', _setClass.bind(null, 'good'));
	socket.on('reconnect', _setClass.bind(null, 'good'));

	function _setClass (className) {
		$scope.$apply(function () {
			$scope.statusLedClass = className;
		});
	}
}])

.factory('socket.io', ['ViewSelector', function(viewSelector) {
	var socket = io.connect('http://poseidon2.appisode.app.sailabove.io/presenter');
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
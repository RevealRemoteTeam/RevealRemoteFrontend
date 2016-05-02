angular.module('RevealRemote', ['ionic', 'ngCordova'])

.controller('ControlsController', function ($scope, rrSocket, rrGauge) {
	rrSocket.on('state', function (data) {
		$scope.$apply(function () {
			//$scope.progress = (Math.round(data.progress * 1000) / 10) + '%';
			rrGauge(Math.floor(data.progress * 100));
			$scope.slideNotes = data.slideNotes ? data.slideNotes.trim().split("\n").join("<br>") : null;
		});
	});

	$scope.emitControl = function (action) {
		rrSocket.emit('control', {
			action: action
		});
	};
})

.controller('LoginController', function ($scope, $cordovaBarcodeScanner, rrSocket) {
	$scope.onPairClick = function () {
		if (!window.cordova) {
			rrSocket.emit('handshake', {
				roomId: prompt('uuid')
			});
			return;
		}

		$cordovaBarcodeScanner.scan().then(function (result) {
			rrSocket.emit('handshake', {
				roomId: result.text
			});
		});
	};
})

.controller('StatusLedController', function ($scope, rrSocket) {
	$scope.statusLedClass = ({ closed: 'mediocre', opening: 'connecting', open: 'good' })[rrSocket.io.readyState];
	rrSocket.on('reconnecting', _setClass.bind(null, 'connecting'));
	rrSocket.on('reconnect_failed', _setClass.bind(null, 'bad'));
	rrSocket.on('connect', _setClass.bind(null, 'good'));
	rrSocket.on('reconnect', _setClass.bind(null, 'good'));

	function _setClass (className) {
		$scope.$apply(function () {
			$scope.statusLedClass = className;
		});
	}
})

.factory('rrGauge', function () {
	var opts = {
		lines: 12, // The number of lines to draw
		angle: 0.15, // The length of each line
		lineWidth: 0.44, // The line thickness
		pointer: {
			length: 0.9, // The radius of the inner circle
			strokeWidth: 0.035, // The rotation offset
			color: '#000000' // Fill color
		},
		limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
		colorStart: '#6FADCF',   // Colors
		colorStop: '#8FC0DA',    // just experiment with them
		strokeColor: '#E0E0E0',   // to see which ones work best for you
		generateGradient: true
	};
	var target = document.getElementById('progress');
	var gauge = new Gauge(target).setOptions(opts);
	gauge.maxValue = 100;

	return function (value) {
		gauge.set(value);
	};
})

.factory('rrSocket', function($rootScope) {
	var socket = io.connect('https://revealremotebackend-gcmkuvzivi.now.sh/presenter');
	socket.on('ok', function () {
		$rootScope.signedIn = true;
	});
	socket.on('not ok', function () {
		// notification using toastr or smth
		$rootScope.signedIn = false;
	});

	return socket;
})

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		!screen.lockOrientation || screen.lockOrientation('portrait');
		if(window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if(window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
});

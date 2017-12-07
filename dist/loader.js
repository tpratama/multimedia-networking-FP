var mainElement = document.getElementsByTagName("ConferenceWidget")[0];
var BASE_URL = mainElement.getAttribute('base-url');

console.log(BASE_URL);

var jquery = document.createElement('script');
jquery.src = BASE_URL + '/dist/jquery.js';
jquery.onload = function() {

	var socket = document.createElement('script');
	socket.src = BASE_URL + '/socket.io/socket.io.js';
	socket.onload = function() {
		// Our payload
		console.log('jquery loaded');
		var rtc = document.createElement('script');
		rtc.src = BASE_URL + '/dist/RTCMultiConnection.min.js';
		rtc.onload = function() {
			var payloadsUrl = [
				BASE_URL + '/dev/adapter.js',
				BASE_URL + '/dev/getHTMLMediaElement.js',
				BASE_URL + '/dist/widget1.js',
				'https://cdn.webrtc-experiment.com/common.js'
			];


			// Load payload, enable Jquery
			payloadsUrl.forEach(function(url) {
				var script = document.createElement('script');
				script.src = url;

				mainElement.append(script);
			});

			//Attach div
			var videoContainer = document.createElement('div');
			videoContainer.id = 'videos-container';

			mainElement.append(videoContainer);
		}
		mainElement.append(rtc);
	}
	mainElement.append(socket);	

	$element = $('<link rel="stylesheet" href=' + BASE_URL + '/dev/getHTMLMediaElement.css>');
	$('ConferenceWidget').append($element);
}

mainElement.append(jquery);

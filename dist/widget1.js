$(document).ready(function() {
    console.log('RUN');
    window.enableAdapter = true; // enable adapter.js

    // ......................................................
    // ..................RTCMultiConnection Code.............
    // ......................................................
    var connection = new RTCMultiConnection();
    // by default, socket.io server is assumed to be deployed on your own URL

    var baseUrl = $('ConferenceWidget').attr('base-url');
    connection.socketURL = baseUrl + '/';
    // comment-out below line if you do not have your own socket.io server
    // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.socketMessageEvent = 'video-conference-demo';
    connection.session = {
        audio: true,
        video: true
    };
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    connection.videosContainer = $('#videos-container')[0];
    connection.onstream = function(event) {
        var existing = document.getElementById(event.streamid);
        if(existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
        event.mediaElement.removeAttribute('src');
        event.mediaElement.removeAttribute('srcObject');
        var video = document.createElement('video');
        video.controls = true;
        if(event.type === 'local') {
            video.muted = true;
        }
        video.srcObject = event.stream;
        var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
        var mediaElement = getHTMLMediaElement(video, {
            title: event.userid,
            buttons: ['full-screen'],
            width: width,
            showOnMouseEnter: false
        });
        connection.videosContainer.appendChild(mediaElement);
        setTimeout(function() {
            mediaElement.media.play();
        }, 5000);
        mediaElement.id = event.streamid;
    };
    connection.onstreamended = function(event) {
        var mediaElement = document.getElementById(event.streamid);
        if (mediaElement) {
            mediaElement.parentNode.removeChild(mediaElement);
        }
    };

    (function(roomid) {
        if (roomid && roomid.length) {
            localStorage.setItem(connection.socketMessageEvent, roomid);
            // auto-join-room
            (function reCheckRoomPresence() {
                connection.checkPresence(roomid, function(isRoomExist) {
                    if (isRoomExist) {
                        connection.join(roomid);
                        return;
                    }
                    setTimeout(reCheckRoomPresence, 5000);
                });
            })();
        }
    })($('ConferenceWidget').attr('room-id'));
});
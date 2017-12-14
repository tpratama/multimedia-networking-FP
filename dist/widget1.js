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
    

    var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
    var mainContainer = $(`<div style="display:block; width: ${width};"></div>`);
    var userContainer = $(`<div id="video-item-user" style="width: ${width};"></div>`);
    var clientsContainer = $(`<div id="video-item" style="height: auto; width: 800px;"></div>`);

    mainContainer.append(userContainer[0]);
    mainContainer.append(clientsContainer[0]);

    $('#videos-container')[0].append(mainContainer[0]);

    connection.videosContainer = $('#video-item')[0];
    connection.userVideoContainer = $('#video-item-user')[0];
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
        var width = 800;
        var roomid = $('ConferenceWidget').attr('room-id');

        if (event.userid != roomid) {
            width = 200;
        }

        console.log(event.userid);
        var mediaElement = getHTMLMediaElement(video, {
            title: event.userid,
            buttons: ['full-screen'],
            width: width,
            showOnMouseEnter: false
        });

        if (event.userid == roomid) {
            connection.userVideoContainer.appendChild(mediaElement);    
        }
        else {
            connection.videosContainer.appendChild(mediaElement);            
        }

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
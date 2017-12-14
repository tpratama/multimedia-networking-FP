





$(document).ready(function() {
    console.log('RUN');
    window.enableAdapter = true; // enable adapter.js

    // ......................................................
    // ..................RTCMultiConnection Code.............
    // ......................................................

    var socket_pesan = io.connect('http://10.151.37.40:9002');
    var username_login = ""

    // on connection to server, ask for user's name with an anonymous callback
    socket_pesan.on('connect', function(){

        var room_id = $('ConferenceWidget').attr('room-id');
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        username_login = prompt("What's your name?");

        var data_user = {username: username_login, room: room_id}
        socket_pesan.emit('adduser', data_user);
    });

    


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
    var mainContainer = $(`<div style="display:block;" class="row"></div>`);
    var userContainer = $(`<div class="col-md-8" id="video-item-user"></div>`);
    var chatContainer = $(`<div class="col-md-4">
                                <h3>Chat</h3>
                                <div id="message" style="padding:10px; height: 400px;  overflow-y: scroll;">
                                    
                                </div>
                              
                                    <div class="form-group">
                                        <input placeholder="Pesan" id="data" class="form-control" type="text">
                                    </div>
                                    <button style="float:right" type="button" id="datasend" class="btn btn-primary">Kirim</button>
                           
                                </div>`);
    var clientsContainer = $(`<div id="video-item" style="background:green; height: auto; width: 800px;"></div>`);

    mainContainer.append(userContainer[0]);
    mainContainer.append(chatContainer[0]);
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

        $('#datasend').click( function() {
            var message = $('#data').val();
            $('#data').val('');
           // alert(message);
            // tell server to execute 'sendchat' and send along one parameter
            socket_pesan.emit('sendchat', message);
        });

        // when the client hits ENTER on their keyboard
        $('#data').keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
                $('#datasend').focus().click();
            }
        });


        socket_pesan.on('updatechat', function (username, data) {
            var align = 'align="right"'

            if(username != username_login)
            {
                align = "";
            }

           $('#message').append('<p '+align+' ><b>'+username + ':</b> ' + data + '</p>');
            //$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
        });
}); 
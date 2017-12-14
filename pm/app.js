var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var path = require('path');

server.listen(9002);

app.use('/io',express.static(path.join(__dirname, 'socket.io')));

// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
//var rooms = ['room1','room2','room3'];

io.sockets.on('connection', function (socket) {
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(data_user){
		// store the username in the socket session for this client
		socket.username = data_user.username;
		//console.log(username);
		// store the room name in the socket session for this client
		socket.room = data_user.room;
		// add the client's username to the global list
		usernames[data_user.username] = data_user.username;
		// send client to room 1
		socket.join(data_user.room);
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to '+data_user.room);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(data_user.room).emit('updatechat', 'SERVER', data_user.username + ' has connected to this room');
		//socket.emit('updaterooms', rooms, 'room1');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		console.log(socket.room);
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

//app.listen('3000');

// Dependencies
var WebSocketServer = require('websocket').server;
var http = require('http');

// Configurations
var RCV_PORT = 3333;
var STREAM_PORT = 3334;


console.log('Opening server instances...');
// Open up the HTTP Server Instance for receiving the stream feed
var feedServer = http.createServer(function(request, response) {});
feedServer.listen(RCV_PORT, function() { });
console.log('- Feed server OK');

// Open up the HTTP Server Instance for sending the stream for the clients
var streamServer = http.createServer(function(request, response) {});
streamServer.listen(STREAM_PORT, function() { });
console.log('- Stream server OK');


console.log('Creating websockets...');
// Create the websocket server
wsFeedServer = new WebSocketServer({
    httpServer: feedServer
});
console.log('- Feed server OK');
wsStreamServer = new WebSocketServer({
    httpServer: streamServer
});
console.log('- Stream server OK');


// Websocket server actions for the feed server
wsFeedServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    wsStreamServer.emit('online');
    console.log('Streamer connected');

    connection.on('blob', function(data) {
        wsStreamServer.emit('stream', data);
        console.log('Sending chunk');
    });

    connection.on('message', function (data) {
        if (data.type == 'utf8') {
            console.log('Sending utf8 data: ' + data.utf8Data);
            wsStreamServer.broadcast(data.utf8Data);
        }
        else if (data.type == 'binary') {
            console.log('Sending chunk of ' + data.binaryData.length + ' bytes');
            wsStreamServer.broadcastBytes(data.binaryData);
        }
    });

    connection.on('close', function(connection) {
        wsStreamServer.emit('offline');
        console.log('Streamer disconnected');
    });

});

// Websocket server actions for the stream server
wsStreamServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    console.log('Viewer connected');
});
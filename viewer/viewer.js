var connection;
var streamBuffer = [];
var videoBuffer = [];

var statusText = document.querySelector('#status');
var video = document.querySelector('video');

function initialize() {
    connect();
    video.addEventListener('ended', playBuffer);
}

function connect() {
    statusText.innerText = 'Connecting to viewer server...';

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    connection = new WebSocket('ws://127.0.0.1:3334');

    connection.onopen = function () {
        statusText.innerText = 'Connected to viewer server.';
    };

    connection.onerror = function (error) {
        console.log(error);
        statusText.innerText = 'An error has ocurred on connection.';
    };

    connection.onmessage = function (message) {
        streamBuffer.push(message.data);
    };

    connection.onclose = function () {
        statusText.innerText = 'You are disconnected. Please refresh the page.';
    };
}

function playBuffer() {
    if (streamBuffer.length > 0) {
        videoBuffer = new Blob(streamBuffer, {type: 'video/webm'});
        streamBuffer = [];
        var currentTime = video.currentTime;
        if (window.URL) {
            video.src = window.URL.createObjectURL(videoBuffer);
        }
        else {
            video.src = videoBuffer;
        }
        //video.currentTime = currentTime;
        console.log('Playing from buffer. Size: ' + videoBuffer.size);
    }
    else {
        console.log('Nothing to play.');
    }
}

initialize();
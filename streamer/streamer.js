var connection;
var cameraStream;
var sourceBuffer;
var streamRecorder;
var recordedData;

var statusText = document.querySelector('#status');
var startStreamButton = document.querySelector('#startStreamBtn');
var stopStreamButton = document.querySelector('#stopStreamBtn');

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', function handleSourceOpen(event) {
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
}, false);


// Function to check browser compatibility
function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

// Generic error callback
function errorCallback(error) {
    console.log('An error has occurred!', error);
}

function initialize() {
    var successCallback = function (stream) {
        var video = document.querySelector('video');
        if (window.URL) {
            video.src = window.URL.createObjectURL(stream);
        }
        else {
            video.src = stream;
        }
        cameraStream = stream;
        video.onloadedmetadata = function (e) {
            statusText.innerText = 'Camera connected.';
            connect();
        };
    };

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({video: true, audio: true}, successCallback, errorCallback);
}

function connect() {
    statusText.innerText = 'Connecting to stream server...';

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    connection = new WebSocket('ws://127.0.0.1:3333');

    connection.onopen = function () {
        statusText.innerText = 'Connected to stream server. Ready to start streaming';
        startStreamButton.disabled = false;
        stopStreamButton.disabled = true;
    };

    connection.onerror = function (error) {
        console.log(error);
        statusText.innerText = 'An error has ocurred on connection.';
        startStreamButton.disabled = true;
        stopStreamButton.disabled = true;
    };

    connection.onmessage = function (message) {
        console.log(message);
    };

    connection.onclose = function () {
        stopStream();
        statusText.innerText = 'You are disconnected. Please refresh the page.';
        startStreamButton.disabled = true;
        stopStreamButton.disabled = true;
    };
}

function startStream() {
    statusText.innerText = 'Stream started.';
    startStreamButton.disabled = true;
    stopStreamButton.disabled = false;

    recordedData = [];
    streamRecorder = new MediaRecorder(cameraStream, {mimeType: 'video/webm;codecs=vp9'});
    streamRecorder.ondataavailable = function (event) {
        if (event.data && event.data.size > 0) {
            recordedData.push(event.data);
            sendVideoChunk();
            streamRecorder.stop();
            streamRecorder.start(1000);
        }
    };
    streamRecorder.onstop = function () {
        //console.log('Finish recording');
    };
    streamRecorder.start(1000);
    console.log('Start recording');
}

function stopStream() {
    streamRecorder.stop();

    statusText.innerText = 'Stream stopped.';
    startStreamButton.disabled = false;
    stopStreamButton.disabled = true;
}

function sendVideoChunk() {
    var blob = recordedData.shift();
    connection.send(blob);
}

// We check for support and then start our application
if (hasGetUserMedia()) {
    initialize();
} else {
    alert('getUserMedia() is not supported in your browser');
}
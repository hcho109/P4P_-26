function formatTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    var milliseconds = Math.floor((time % 1) * 1000);

    return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds) + ":" + (milliseconds < 100 ? "0" : "") + (milliseconds < 10 ? "0" : "") + milliseconds;
}

// Define the event handler function
function handleVideoFileChange() {
    const videoFiles = this.files;
    if (!videoFiles || !videoFiles[0]) {
        return;
    }

    // Load the video file
    var videoPlayer = document.getElementById('video');
    videoPlayer.src = URL.createObjectURL(videoFiles[0]);
    // videoPlayer.play();

    var currentTimeElement = document.getElementById('currentTime');
    var currentTimeInSecElement = document.getElementById('currentTimeinSec');
    var durationElement = document.getElementById('duration');
    var playEnabled = document.getElementById('playEnabled');
    let playerStatus = document.getElementById("playerStatus");

    videoPlayer.addEventListener('durationchange', function() {
        duration = videoPlayer.duration;

        durationElement.textContent = duration;
        // var formattedDuration = formatTime(duration);
        // console.log('Video duration changed: ' + formattedDuration);
    });

    videoPlayer.addEventListener('timeupdate', function() {
        currentTime = videoPlayer.currentTime;

        var formattedTime = formatTime(currentTime);
        currentTimeElement.textContent = formattedTime;

        currentTimeInSec = currentTime.toFixed(2);
        currentTimeInSecElement.textContent = currentTimeInSec;
        
    });

    videoPlayer.addEventListener('play', function() {
        isPlaying = 1;
        playEnabled.textContent = isPlaying;
        playerStatus.textContent = "Video is playing...";
    });
    
    videoPlayer.addEventListener('pause', function() {
        isPlaying = 0;
        playEnabled.textContent = isPlaying;
        playerStatus.textContent = "Video paused...";
    });
    
    videoPlayer.addEventListener('ended', function() {
        isPlaying = 0;
        playEnabled.textContent = isPlaying;
        playerStatus.textContent = "Video ended...";
    });
}

var isPlaying = 0;
var duration = 0;
var currentTime = 0;
var currentTimeInSec = 0;
var videoFileInput = document.getElementById('video-file-input');

videoFileInput.addEventListener('change', handleVideoFileChange);






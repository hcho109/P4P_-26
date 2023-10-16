/* Video player JS 
    upload video file when a video file is selected from user*/
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

    let playerStatus = document.getElementById("playerStatus");

    videoPlayer.addEventListener('play', function() {
        playerStatus.textContent = "Video is playing...";
    });
    
    videoPlayer.addEventListener('pause', function() {
        playerStatus.textContent = "Video paused...";
    });
    
    videoPlayer.addEventListener('ended', function() {
        playerStatus.textContent = "Video ended...";
    });
}

var videoFileInput = document.getElementById('video-file-input');

videoFileInput.addEventListener('change', handleVideoFileChange);








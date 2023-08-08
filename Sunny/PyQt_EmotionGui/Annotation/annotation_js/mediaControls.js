// mediaControls.js

var isPlaying = false;
var media_duration = 0;
var elapsedTime = 0;

function setupMediaControls(videoPlayer, audioPlayer) {
    // Update the current play status for video and audio elements
    videoPlayer.addEventListener('play', function() {
        isPlaying = true;
    });
    videoPlayer.addEventListener('pause', function() {
        isPlaying = false;
    });
    videoPlayer.addEventListener('ended', function() {
        isPlaying = false;
    });

    videoPlayer.addEventListener('durationchange', function() {
        media_duration = videoPlayer.duration;
        //console.log('video duration:', media_duration);
    });

    videoPlayer.addEventListener('timeupdate', function() {
        elapsedTime = videoPlayer.currentTime;
        //console.log('video time update:', elapsedTime);
    });

    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
    });
    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
    });
    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
    });
    audioPlayer.addEventListener('durationchange', function() {
        media_duration = audioPlayer.duration;
        //console.log('audio duration:', media_duration);
    });

    audioPlayer.addEventListener('timeupdate', function() {
        elapsedTime = audioPlayer.currentTime;
        //console.log('audio time update:', elapsedTime);
    });

}

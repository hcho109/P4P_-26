/* MediaContol JS to assingn variale based on the status of media player
    handles error messages related to media players */
function setupMediaControls(videoPlayer, audioPlayer) {
    
    videoPlayer.addEventListener('durationchange', function() {
        media_duration = videoPlayer.duration;
        //console.log('video duration:', media_duration);
    });

    videoPlayer.addEventListener('timeupdate', function() {
        elapsedTime = videoPlayer.currentTime;
        //console.log('video time update:', elapsedTime);
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

// Function to handle video file errors
function handleVideoError(event) {
    switch (event.target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
            video_error_msg.textContent = 'Video playback aborted.';
            break;
        case MediaError.MEDIA_ERR_NETWORK:
            video_error_msg.textContent = 'Video network error.';
            break;
        case MediaError.MEDIA_ERR_DECODE:
            video_error_msg.textContent = 'Video decode error.';
            break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            video_error_msg.textContent = 'Selected video format is not supported.';
            break;
        default:
            video_error_msg.textContent = 'Video unknown error.';
            break;
    }
}

// Function to handle audio file errors
function handleAudioError(event) {
    switch (event.target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
            audio_error_msg.textContent = 'Audio playback aborted.';
            break;
        case MediaError.MEDIA_ERR_NETWORK:
            audio_error_msg.textContent = 'Audio network error.';
            break;
        case MediaError.MEDIA_ERR_DECODE:
            audio_error_msg.textContent = 'Audio decode error.';
            break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            audio_error_msg.textContent = 'Selected audio format is not supported.';
            break;
        default:
            audio_error_msg.textContent = 'Audio unknown error.';
            break;
    }
}

// Function to reset error messages when valid media sources are loaded
function resetErrorMessages() {
    video_error_msg.textContent = 'A video is selected and ready for playback.';
    audio_error_msg.textContent = 'An audio is selected and ready for playback.';
}

var media_duration = 0;
var elapsedTime = 0;

var videoPlayer = document.getElementById('video');
var audioPlayer = document.getElementById('audio');

// Get the error message elements
var video_error_msg = document.getElementById('playerStatus');
var audio_error_msg = document.getElementById('AudioPlayerStatus');

// Add event listeners to the video and audio players to handle errors
videoPlayer.addEventListener('error', handleVideoError);
audioPlayer.addEventListener('error', handleAudioError);


// Add event listeners to the video and audio players to reset error messages on successful load
videoPlayer.addEventListener('loadeddata', resetErrorMessages);
audioPlayer.addEventListener('loadeddata', resetErrorMessages);

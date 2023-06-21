const waveformContainer = document.getElementById('waveform');
const audioFileInput = document.getElementById('audio-file-input');
const videoFileInput = document.getElementById('video-file-input');

// const sliderEl = document.querySelector("#valenceRange")
// const sliderValue = document.querySelector(".valenceValue")

// const sliderE2 = document.querySelector("#arousalRange")
// const sliderValue2 = document.querySelector(".arousalValue")

// Handle 1D sliders input change event
sliderEl.addEventListener("input", (event) => {

    const tempSliderValue = event.target.value; 
    
    sliderValue.textContent = tempSliderValue;
    
    const progress = (tempSliderValue / sliderEl.max) * 100;

    sliderEl.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;
})

sliderE2.addEventListener("input", (event) => {
    const tempSliderValue = event.target.value; 
    
    sliderValue2.textContent = tempSliderValue;
    
    const progress = (Math.abs(tempSliderValue) / 20) * 100;

    sliderE2.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;
})

//Handle multiple sliders input change event
var rangeSlider = function() {
    var sliders = document.querySelectorAll('.range-slider');
    
    sliders.forEach(function(slider) {
        var range = slider.querySelector('.range-slider__range');
        var value = slider.querySelector('.range-slider__value');

        var values = slider.querySelectorAll('.range-slider__value');
        values.forEach(function(val) {
        var valValue = val.previousElementSibling.getAttribute('value');
        val.innerHTML = valValue;
        });

        range.addEventListener('input', function() {
        value.innerHTML = this.value;
        });
    });
};

rangeSlider();

// Initialize WaveSurfer
const wavesurfer = WaveSurfer.create({
    container: waveformContainer,
    waveColor: 'lightgray',
    progressColor: 'red',
    barWidth: 2
});

// Handle audio file input change event
audioFileInput.addEventListener('change', function () {
    const audioFiles = this.files;
    if (!audioFiles || !audioFiles[0]) {
        return;
    }

    const audioFileUrl = URL.createObjectURL(audioFiles[0]);

    // Load the audio file

    wavesurfer.load(audioFileUrl);
});

// Handle video file input change event
videoFileInput.addEventListener('change', function () {
    const videoFiles = this.files;
    if (!videoFiles || !videoFiles[0]) {
        return;
    }

    const videoFileUrl = URL.createObjectURL(videoFiles[0]);

    // Load the video file
    var video = document.getElementById('video');
    video.src = videoFileUrl;
    video.play();
});

function openPlayer(evt, mediaPlayerName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("mediaTabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("mediaTablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(mediaPlayerName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultPlayerOpen").click();
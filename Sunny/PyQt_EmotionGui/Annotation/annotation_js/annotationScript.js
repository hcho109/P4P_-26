
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

// Handle video file input change event
const videoFileInput = document.getElementById('video-file-input');

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

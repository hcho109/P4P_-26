// Define the active slider variable
let activeSlider = null;

// Function to set the active slider
function setActiveSlider(sliderId) {
  activeSlider = sliderId;
}

// Function to clear the active slider
function clearActiveSlider() {
  activeSlider = null;
}

// Handle multiple sliders' input change event
function rangeSlider() {
  var sliders = document.querySelectorAll('.range-slider');

  sliders.forEach(function (slider) {
    var range = slider.querySelector('.range-slider__range');
    var value = slider.querySelector('.range-slider__value');

    var values = slider.querySelectorAll('.range-slider__value');
    values.forEach(function (val) {
      var valValue = val.previousElementSibling.getAttribute('value');
      val.innerHTML = valValue;
    });

    range.addEventListener('mousedown', function () {
      setActiveSlider(range.id); // Set the active slider when mouse is down
    });

    range.addEventListener('input', function () {
      value.innerHTML = this.value;
    });

    range.addEventListener('mouseup', function () {
      clearActiveSlider(); // Clear the active slider when mouse is up
    });
  });
}
// Call the rangeSlider function initially
rangeSlider();

// Function to record data every 300ms for the active slider
function recordDataForActiveSlider() {
  if (activeSlider) {
    const interval = setInterval(() => {
      const sliderValue = document.getElementById(activeSlider).value;
      console.log(`Active slider (${activeSlider}) value: ${sliderValue}`);
    }, 300);

    // Stop recording when media ends or is paused
    videoPlayer.addEventListener('ended', () => clearInterval(interval));
    audioPlayer.addEventListener('ended', () => clearInterval(interval));
    videoPlayer.addEventListener('pause', () => clearInterval(interval));
    audioPlayer.addEventListener('pause', () => clearInterval(interval));
  }
}

// Add an event listener to the media player for play event
videoPlayer.addEventListener('play', recordDataForActiveSlider);
audioPlayer.addEventListener('play', recordDataForActiveSlider);

// Add an event listener to the media player for pause event
videoPlayer.addEventListener('pause', clearActiveSlider);
audioPlayer.addEventListener('pause', clearActiveSlider);




//Handle multiple sliders input change event
function rangeSlider() {
    var sliders = document.querySelectorAll('.range-slider');
    
    sliders.forEach(function(slider) {
        range = slider.querySelector('.range-slider__range');
        var value = slider.querySelector('.range-slider__value');

        var values = slider.querySelectorAll('.range-slider__value');
        values.forEach(function(val) {
        var valValue = val.previousElementSibling.getAttribute('value');
        val.innerHTML = valValue;
        });

        // Add a mousedown event listener to the range input
        range.addEventListener('mousedown', function() {
            // Determine which slider is being interacted with
            sliderType = this.getAttribute('data-slider-type'); // Add a data attribute to each slider
            console.log('Slider mousedown event fired');
            console.log('sliderType:', sliderType); // Check the value of sliderType
            
            clearInterval(dataInterval);
            
            if (!videoPlayer.paused || !audioPlayer.paused){
            
               // Do something based on the slider type
                if (sliderType === 'valence') {
                    console.log("User is interacting with Valence slider");
                    // Perform actions specific to Valence slider
                    // save data every 300ms
                    dataInterval =setInterval(() => autoSaving(null), 300);

                } else if (sliderType === 'arousal') {
                    console.log("User is interacting with Arousal slider");
                    // save data every 300ms
                    dataInterval =setInterval(() => autoSaving(null), 300);
                } else if (sliderType === 'dominance') {
                    console.log("User is interacting with Dominance slider");
                    // save data every 300ms
                    dataInterval =setInterval(() => autoSaving(null), 300);
                }
            }
        });

        range.addEventListener('input', function() {
            value.innerHTML = this.value;
            currentValue = this.value;
        });
    });
};
function autoSaving(){
    console.log('Auto save triggered');
    if (!videoPlayer.paused || !audioPlayer.paused){
        console.log("Autosaving: Media is playing");

        // Get the current valence slider value and timestamp
        //var valenceValue = parseFloat(range.value);
        saveData(currentValue);
    } else if (videoPlayer.ended || audioPlayer.ended){
        console.log("Autosaving: Media has ended");

        clearInterval(dataInterval);
    } else{
        console.log("Autosaving: Media is paused");

        clearInterval(dataInterval);
    }
}

// Save data for valence, arousal, timestamp in 2s.f.
function saveData(x){
    if (sliderType === 'valence') {
        console.log('valence data added');
        valence_1dPoints.push(x); 
    } else if(sliderType == 'arousal'){
        console.log('arousal data added');
        arousal_1dPoints.push(x); 
    } else if(sliderType == 'dominance'){
        console.log('dominance data added');
        dominance_1dPoints.push(x); 
    }
    
    time_1dPoints.push(elapsedTime.toFixed(2)); 

    console.log('timestamps:', time_1dPoints); 
    console.log('val array:', valence_1dPoints); 
    console.log('aro array:', arousal_1dPoints); 
    console.log('domin:', dominance_1dPoints); 

    // Save the points to localStorage
    localStorage.setItem('1d_time_points', JSON.stringify(time_1dPoints));
    localStorage.setItem('1d_valence_points', JSON.stringify(valence_1dPoints));
    localStorage.setItem('1d_arousal_points', JSON.stringify(arousal_1dPoints));
    localStorage.setItem('1d_dominance_points', JSON.stringify(dominance_1dPoints));
}

// Initialize new arrays to store Valence, Arousal, Dominance and timestamps data

var range;
var sliderType;
var currentValue;

var valence_1dPoints = [];
var arousal_1dPoints = [];
var dominance_1dPoints = [];
var time_1dPoints = [];

var dataInterval=0;


rangeSlider();  



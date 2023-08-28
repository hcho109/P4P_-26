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
                    update_valence_note_lbl.innerHTML = "Valence Annotation in progress...";
                    dataInterval =setInterval(() => autoSaving(null), 300);

                } else if (sliderType === 'arousal') {
                    console.log("User is interacting with Arousal slider");
                    update_arousal_note_lbl.innerHTML = "Arousal Annotation in progress...";
                    // save data every 300ms
                    dataInterval =setInterval(() => autoSaving(null), 300);
                } else if (sliderType === 'dominance') {
                    console.log("User is interacting with Dominance slider");
                    update_dominance_note_lbl.innerHTML = "Dominance Annotation in progress...";
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
        if(sliderType == 'valence') {
            update_valence_note_lbl.innerHTML = "Annotation completed! To check your data, click 'View Data' button.";
        } else if (sliderType =='arousal'){
            update_arousal_note_lbl.innerHTML = "Annotation completed! To check your data, click 'View Data' button.";
        } else{
            update_dominance_note_lbl.innerHTML = "Annotation completed! To check your data, click 'View Data' button.";
        }
    } else{
        console.log("Autosaving: Media is paused");
        clearInterval(dataInterval);
        if(sliderType == 'valence') {
            update_valence_note_lbl.innerHTML = "Paused the media file?<br> To resume annotating, play the media and move the Valence slider. <br> Or, Restart from the beginning with the 'Re-annotate' button.";
        } else if (sliderType =='arousal'){
            update_arousal_note_lbl.innerHTML = "Paused the media file?<br> To resume annotating, play the media and move the Arousal slider. <br> Or, Restart from the beginning with the 'Re-annotate' button.";
        } else{
            update_dominance_note_lbl.innerHTML = "Paused the media file?<br> To resume annotating, play the media and move the Dominance slider. <br> Or, Restart from the beginning with the 'Re-annotate' button.";
        }
    }
}

// Save data for valence, arousal, timestamp in 2s.f.
function saveData(x){
    var currentTimeStamp = elapsedTime.toFixed(2); // Get the current timestamp

    if (sliderType === 'valence') {
        console.log('valence data added');
        valence_1dPoints.push(x); 
        valence_timePoints.push(currentTimeStamp);
    } else if(sliderType == 'arousal'){
        console.log('arousal data added');
        arousal_1dPoints.push(x); 
        arousal_timePoints.push(currentTimeStamp);
    } else if(sliderType == 'dominance'){
        console.log('dominance data added');
        dominance_1dPoints.push(x); 
        dominance_timePoints.push(currentTimeStamp);
    }
    
    console.log('timestamps for valence:', valence_timePoints);
    console.log('val array:', valence_1dPoints);
    console.log('timestamps for arousal:', arousal_timePoints);
    console.log('aro array:', arousal_1dPoints); 
    console.log('timestamps for dominance:', dominance_timePoints);
    console.log('domin:', dominance_1dPoints); 

    // Save the points to localStorage
    localStorage.setItem('1d_valence_points', JSON.stringify(valence_1dPoints));
    localStorage.setItem('1d_arousal_points', JSON.stringify(arousal_1dPoints));
    localStorage.setItem('1d_dominance_points', JSON.stringify(dominance_1dPoints));
    localStorage.setItem('1d_valence_time_points', JSON.stringify(valence_timePoints));
    localStorage.setItem('1d_arousal_time_points', JSON.stringify(arousal_timePoints));
    localStorage.setItem('1d_dominance_time_points', JSON.stringify(dominance_timePoints));
}

// Function to clear values for a specific button type (Valence, Arousal, Dominance)
function clear1dValues(buttonType) {
    if (buttonType === 'valence') {
        valence_1dPoints = [];
        valence_timePoints = [];
        localStorage.removeItem('1d_valence_time_points');
        localStorage.removeItem('1d_valence_points');
        console.log('Cleared Valence values');
        update_valence_note_lbl.innerHTML = "Annotation data has been reset! <br> Get started by playing a media file and move the slider.";
    } else if (buttonType === 'arousal') {
        arousal_1dPoints = [];
        arousal_timePoints = [];
        localStorage.removeItem('1d_arousal_time_points');
        localStorage.removeItem('1d_arousal_points');
        console.log('Cleared Arousal values');
        update_arousal_note_lbl.innerHTML = "Annotation data has been reset! <br> Get started by playing a media file and move the slider.";
    } else if (buttonType === 'dominance') {
        dominance_1dPoints = [];
        dominance_timePoints = [];
        localStorage.removeItem('1d_dominance_time_points');
        localStorage.removeItem('1d_dominance_points');
        console.log('Cleared Dominance values');
        update_dominance_note_lbl.innerHTML = "Annotation data has been reset! <br> Get started by playing a media file and move the slider.";
    }
}

// Function to re-annotate values for a specific button type
function reAnnotate1dValues(buttonType) {
    // Pause the media player
    videoPlayer.pause();
    audioPlayer.pause();

    // Set the slider position to the beginning
    videoPlayer.currentTime = 0;
    audioPlayer.currentTime = 0;

    // Clear the values for the specific button type
    clear1dValues(buttonType);

    // Clear the out of bounds label
    if (buttonType === 'valence') {
        update_valence_note_lbl.innerHTML = "You can now begin the Valence annotation again";
    } else if (buttonType === 'arousal') {
        update_arousal_note_lbl.innerHTML = "You can now begin the Arousal annotation again";
    } else if (buttonType === 'dominance') {
        update_dominance_note_lbl.innerHTML = "You can now begin the Dominance annotation again";
    }
}

// Function to open the data display window for a specific button type
function open1dDataWindow(buttonType) {
    localStorage.setItem('data_type', '1D'); // Set data_type to '1D'
    localStorage.setItem('1d_annotation_type', buttonType); // Store the annotation type
    var dataDisplayWindow = window.open('annotation_data.html', '_blank', 'width=800,height=600');
    if (!dataDisplayWindow) {
        alert('Please allow pop-ups to view the data.');
    }
}

function generate_1dCSVContent(buttonType) {
    var maxAryLength = Math.max(valence_timePoints.length, arousal_timePoints.length, dominance_timePoints.length);

    let csv_1dContent = "Time," + buttonType.charAt(0).toUpperCase() + buttonType.slice(1) + "\n"; // Add header row

    if (buttonType === 'valence') {
        for (let i = 0; i < maxAryLength; i++) {
            const timePoint = valence_timePoints[i] !== undefined ? valence_timePoints[i] : "";
            const valenceData = valence_1dPoints[i] !== undefined ? valence_1dPoints[i] : "";
            csv_1dContent += `${timePoint},${valenceData}\n`;
        }
        return csv_1dContent;
    } else if (buttonType === 'arousal') {
        for (let i = 0; i < maxAryLength; i++) {
            const timePoint = arousal_timePoints[i] !== undefined ? arousal_timePoints[i] : "";
            const arousalData = arousal_1dPoints[i] !== undefined ? arousal_1dPoints[i] : "";
            csv_1dContent += `${timePoint},${arousalData}\n`;
        }
        return csv_1dContent;
    } else if (buttonType === 'dominance') {
        for (let i = 0; i < maxAryLength; i++) {
            const timePoint = dominance_timePoints[i] !== undefined ? dominance_timePoints[i] : "";
            const dominanceData = dominance_1dPoints[i] !== undefined ? dominance_1dPoints[i] : "";
            csv_1dContent += `${timePoint},${dominanceData}\n`;
        }
        return csv_1dContent;
    }
}

function downloadCSV_1d(buttonType) {
    const csv_1dContent = generate_1dCSVContent(buttonType);
    const blob = new Blob([csv_1dContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${buttonType}_1d_annotation_data.csv`;
    a.style.display = "none";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearAllValues() {
    valence_1dPoints = [];
    valence_timePoints = [];
    localStorage.removeItem('1d_valence_time_points');
    localStorage.removeItem('1d_valence_points');
    arousal_1dPoints = [];
    arousal_timePoints = [];
    localStorage.removeItem('1d_arousal_time_points');
    localStorage.removeItem('1d_arousal_points');
    dominance_1dPoints = [];
    dominance_timePoints = [];
    localStorage.removeItem('1d_dominance_time_points');
    localStorage.removeItem('1d_dominance_points');

    document.getElementById('update-1dNote').innerHTML = "All annotation data has been cleared. Get started by playing a media file and moving the sliders.";
}

function openAllDataWindow() {
    localStorage.setItem('data_type', '1D');
    localStorage.setItem('1d_annotation_type', 'all');
    var dataDisplayWindow = window.open('annotation_data.html', '_blank', 'width=800,height=600');
    if (!dataDisplayWindow) {
        alert('Please allow pop-ups to view the data.');
    }
}

function generateAllCSVContent() {
    let csvAllContent = "Time,Valence,Time,Arousal,Time,Dominance\n"; // Add header row
    var maxArrayLength = Math.max(
        valence_timePoints.length,
        arousal_timePoints.length,
        dominance_timePoints.length
    );

    for (let i = 0; i < maxArrayLength; i++) {
        const timePointValence = valence_timePoints[i] !== undefined ? valence_timePoints[i] : "";
        const timePointArousal = arousal_timePoints[i] !== undefined ? arousal_timePoints[i] : "";
        const timePointDominance = dominance_timePoints[i] !== undefined ? dominance_timePoints[i] : "";
        const valenceData = valence_1dPoints[i] !== undefined ? valence_1dPoints[i] : "";
        const arousalData = arousal_1dPoints[i] !== undefined ? arousal_1dPoints[i] : "";
        const dominanceData = dominance_1dPoints[i] !== undefined ? dominance_1dPoints[i] : "";

        csvAllContent += `${timePointValence},${valenceData},${timePointArousal},${arousalData},${timePointDominance},${dominanceData}\n`;
    }
    return csvAllContent;
}

function downloadAllCSV() {
    const csvAllContent = generateAllCSVContent();
    const blob = new Blob([csvAllContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "id_annotation_data.csv";
    a.style.display = "none";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    document.getElementById('update-1dNote').innerHTML = "All current annotation data has been saved as a CSV file.";
}


// Initialize all variables
var range;
var sliderType;
var currentValue;

var valence_1dPoints = [];
var arousal_1dPoints = [];
var dominance_1dPoints = [];
var valence_timePoints = [];
var arousal_timePoints = [];
var dominance_timePoints = [];

var dataInterval=0;

var update_valence_note_lbl =document.getElementById('valence__update-note');
var update_arousal_note_lbl =document.getElementById('arousal__update-note');
var update_dominance_note_lbl =document.getElementById('dominance__update-note');

rangeSlider();  
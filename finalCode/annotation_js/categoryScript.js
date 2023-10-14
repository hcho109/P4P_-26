/* Discrete/ Categorical Emotion Model JS
    helps users upload custom emotion list and save their selections  */

// Populate default emotion options
const defaultEmotions = ['Happy', 'Sad', 'Fear', 'Disgust', 'Anger', 'Surprise'];
const emotionListSelect = document.getElementById('emotionList');

updateEmotionList(defaultEmotions);

// Event listener for custom list input change
const customListInput = document.getElementById('customListInput');
customListInput.addEventListener('change', handleCustomListUpload);

function handleCustomListUpload(event) {
  const file = event.target.files[0];
  if (file) {
    Papa.parse(file, {
      complete: function(results) {
        const customEmotions = results.data;
        localStorage.setItem('customEmotions', JSON.stringify(customEmotions));
        updateEmotionList(customEmotions);
      }
    });
  }
}

// Update the emotion list based on the provided emotions
function updateEmotionList(emotions) {
  emotionListSelect.innerHTML = '';
  emotions.forEach(emotion => {
    const option = document.createElement('option');
    option.value = emotion;
    option.text = emotion;
    emotionListSelect.appendChild(option);
  });
}


// Event listener for "Retrieve Default List" button
const retrieveDefaultListBtn = document.getElementById('retrieveDefaultListBtn');
retrieveDefaultListBtn.addEventListener('click', () => {
  updateEmotionList(defaultEmotions);
});


// Event listener for "Save Selection" button, allows multiple selections
const saveSelectionBtn = document.getElementById('save_selection_btn');
saveSelectionBtn.addEventListener('click', () => {

    // Clear any previous error messages
    const errorPlaceholder = document.getElementById('errorPlaceholder');
    errorPlaceholder.textContent = '';

    // Get the media file name from the user input
    const mediaFileNameInput = document.getElementById('mediaFileNameInput');
    const mediaFileName = mediaFileNameInput.value.trim();

    if (!mediaFileName) {
        const errorPlaceholder = document.getElementById('errorPlaceholder');
        errorPlaceholder.textContent = "Please enter a media file name.";
        return;
    }

    // Create a comma-separated string of selected emotions
    const selectedEmotions = Array.from(emotionListSelect.selectedOptions).map(option => option.value);
    
    // Each emotion in a separate column
    const emotionRow = selectedEmotions.map(emotion => `"${emotion}"`).join(','); 
    
    // Create CSV content
    const csvContent = `"${mediaFileName}",${emotionRow}\n`;

    // Create a blob and a download link to save the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'categorical_annotation_data.csv';
    a.textContent = 'Download CSV';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Function to save VA plot as an image
async function savePlotAsImage() {
    // Generate a timestamp for unique filenames
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("plot"); // Get the plot container element
    
    try {
        // Use html2canvas library to capture the content of the plot container
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png"); // Convert canvas content to a data URL
        
        // Create a download link for the image
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `CSV_plot_${timestamp}.png`; // Set the download filename
        a.click(); // Trigger the click event to initiate download
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

// Function to save spectrogram as an image
async function saveSpectrogramAsImage() {
    // Generate a timestamp for unique filenames
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("spectrogram"); // Get the spectrogram container element
    
    try {
        // Use html2canvas library to capture the content of the spectrogram container
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png"); // Convert canvas content to a data URL
        
        // Create a download link for the image
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `spectrogramIMG${timestamp}.png`; // Set the download filename
        a.click(); // Trigger the click event to initiate download
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

// Function to save waveform as an image
async function saveWaveformAsImage() {
    // Generate a timestamp for unique filenames
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("waveform"); // Get the waveform container element
    
    try {
        // Use html2canvas library to capture the content of the waveform container
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png"); // Convert canvas content to a data URL
        
        // Create a download link for the image
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `waveformIMG_${timestamp}.png`; // Set the download filename
        a.click(); // Trigger the click event to initiate download
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

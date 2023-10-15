//visualise VA plot
async function savePlotAsImage() {
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("plot");
    
    try {
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png");
        
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `CSV_plot_${timestamp}.png`;
        a.click();
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

//spectrogram
async function saveSpectrogramAsImage() {
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("pectrogram");
    
    try {
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png");
        
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `spectrogramIMG${timestamp}.png`;
        a.click();
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

//waveform
async function saveWaveformAsImage() {
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("waveform");
    
    try {
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png");
        
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `waveformIMG_${timestamp}.png`;
        a.click();
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

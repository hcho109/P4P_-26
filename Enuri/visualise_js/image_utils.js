async function savePlotAsImage() {
    const timestamp = new Date().getTime();
    const plotContainer = document.getElementById("plot");
    
    try {
        const canvas = await html2canvas(plotContainer);
        const dataURL = canvas.toDataURL("image/png");
        
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `plot_${timestamp}.png`;
        a.click();
    } catch (error) {
        console.error("Error saving plot as image:", error);
    }
}

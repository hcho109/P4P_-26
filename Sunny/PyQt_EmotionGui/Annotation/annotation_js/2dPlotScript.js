// Draw 2d V-A plot on html canvas 

// Function to convert x and y coordinates to canvas coordinates
function toCanvasX(x) {
    return (x - plotMin) / (plotMax - plotMin) * (canvasWidth * plotRectRatio) + (canvasWidth * (1 - plotRectRatio)) / 2;
}

function toCanvasY(y) {
    return canvasHeight - (y - plotMin) / (plotMax - plotMin) * (canvasHeight * plotRectRatio) - (canvasHeight * (1 - plotRectRatio)) / 2;
}

// Function to convert canvas coordinates to Valence and Arousal values

function toValence(canvasX) {
    return plotMin + (canvasX - (canvasWidth * (1 - plotRectRatio) / 2)) / (canvasWidth * plotRectRatio) * (plotMax - plotMin);
}

// Function to convert canvas Y coordinate to Arousal value
function toArousal(canvasY) {
    return plotMax - (canvasY - (canvasHeight * (1 - plotRectRatio) / 2)) / (canvasHeight * plotRectRatio) * (plotMax - plotMin);
}

// Function to draw the plot
function drawPlot() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the outer rectangle
    ctx.strokeStyle = 'black';
    ctx.strokeRect(canvasWidth * (1 - plotRectRatio) / 2, canvasHeight * (1 - plotRectRatio) / 2, canvasWidth * plotRectRatio, canvasHeight * plotRectRatio);

    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(toCanvasX(plotMin), toCanvasY(0));
    ctx.lineTo(toCanvasX(plotMax), toCanvasY(0));
    ctx.moveTo(toCanvasX(0), toCanvasY(plotMin));
    ctx.lineTo(toCanvasX(0), toCanvasY(plotMax));
    ctx.stroke();

    // Draw gridlines within the inner rectangle
    ctx.strokeStyle = 'lightgrey';

    // Draw gridlines and tick marks for positive x and y values
    for (let x = gridStep; x < plotMax; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), toCanvasY(plotMin));
        ctx.lineTo(toCanvasX(x), toCanvasY(plotMax));
        ctx.stroke();

        // Draw tick marks for x values
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), toCanvasY(0) - 5);
        ctx.lineTo(toCanvasX(x), toCanvasY(0) + 5);
        ctx.strokeStyle = 'black'; // Change tick mark color to black
        ctx.stroke();
        ctx.strokeStyle = 'lightgrey'; // Reset gridline color to lightgrey
    }
    for (let y = gridStep; y < plotMax; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(plotMin), toCanvasY(y));
        ctx.lineTo(toCanvasX(plotMax), toCanvasY(y));
        ctx.stroke();

        // Draw tick marks for y values
        ctx.beginPath();
        ctx.moveTo(toCanvasX(0) - 5, toCanvasY(y));
        ctx.lineTo(toCanvasX(0) + 5, toCanvasY(y));
        ctx.strokeStyle = 'black'; // Change tick mark color to black
        ctx.stroke();
        ctx.strokeStyle = 'lightgrey'; // Reset gridline color to lightgrey
    }

    // Draw gridlines and tick marks for negative x and y values
    for (let x = -gridStep; x > plotMin; x -= gridStep) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), toCanvasY(plotMin));
        ctx.lineTo(toCanvasX(x), toCanvasY(plotMax));
        ctx.stroke();

        // Draw tick marks for x values
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), toCanvasY(0) - 5);
        ctx.lineTo(toCanvasX(x), toCanvasY(0) + 5);
        ctx.strokeStyle = 'black'; // Change tick mark color to black
        ctx.stroke();
        ctx.strokeStyle = 'lightgrey'; // Reset gridline color to lightgrey
    }
    for (let y = -gridStep; y > plotMin; y -= gridStep) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(plotMin), toCanvasY(y));
        ctx.lineTo(toCanvasX(plotMax), toCanvasY(y));
        ctx.stroke();

        // Draw tick marks for y values
        ctx.beginPath();
        ctx.moveTo(toCanvasX(0) - 5, toCanvasY(y));
        ctx.lineTo(toCanvasX(0) + 5, toCanvasY(y));
        ctx.strokeStyle = 'black'; // Change tick mark color to black
        ctx.stroke();
        ctx.strokeStyle = 'lightgrey'; // Reset gridline color to lightgrey
    }

    // Draw the circle
    ctx.beginPath();
    const centerX = toCanvasX(0);
    const centerY = toCanvasY(0);
    const radius = (canvasWidth * plotRectRatio * 0.5) / plotMax;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw title, x and y axis labels
    ctx.font = 'bold 15px Roboto';
    ctx.fillText('V-A Plot', canvasWidth/2.16, 60);

    ctx.font = 'bold 13px Roboto';
    ctx.fillText('Valence', canvasWidth / 2.16, canvasHeight -50);

    ctx.save();
    ctx.translate(canvasWidth * (1 - plotRectRatio) / 2 - 45, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Arousal', -20, 5);
    ctx.restore();

    // Draw y values on the outer left side
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -1.0; y <= 1.0; y += gridStep) {
        ctx.fillText(y.toFixed(2), toCanvasX(-1.1) - 5, toCanvasY(y));
    }

    // Draw x values on the outer bottom side
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = -1.0; x <= 1.0; x += gridStep) {
        ctx.fillText(x.toFixed(2), toCanvasX(x),  toCanvasY(-1.1) +5);
    }

    // Draw the landmark scatter plots
    // Landmark scatter plot data
    var landmarkEmotions = ['angry', 'afraid', 'sad', 'bored', 'excited', 'interested', 'happy', 'pleased', 'relaxed', 'content'];
    var landmarkValence = [-0.7, -0.65, -0.8, -0.1, 0.37, 0.2, 0.5, 0.35, 0.6, 0.5];
    var landmarkArousal = [0.65, 0.5, -0.15, -0.45, 0.9, 0.7, 0.5, 0.35, -0.3, -0.45];

    for (let i = 0; i < landmarkEmotions.length; i++) {
        const x = landmarkValence[i];
        const y = landmarkArousal[i];

        // Convert x and y coordinates to canvas coordinates
        const plotX = toCanvasX(x);
        const plotY = toCanvasY(y);
        console.log('plotX:', plotX, 'plotY:', plotY);


        // Draw the landmark point
        ctx.beginPath();
        ctx.arc(plotX, plotY, 2, 0, 2 * Math.PI);
        
        ctx.fill();

        // Add text label for the landmark
        
        ctx.font = '11px Roboto';
        ctx.fillText(landmarkEmotions[i], plotX + 12, plotY - 15);

        }
}

// Print x and y coordinates in 2s.f.
function printData(x,y){
    let xData = document.getElementById('xData');
    let yData = document.getElementById('yData');

    xData.value = toValence(x).toFixed(2);
    yData.value = toArousal(y).toFixed(2);
}

function calculateRadius() {
    // Define min and max radius values
    const minRadius = 1;
    const maxRadius = 10;

    // Calculate progress as a value between 0 and 1
    const progress = elapsedTime / media_duration;

    // Calculate the current radius based on the progress
    const currentRadius = maxRadius - (maxRadius - minRadius) * progress;

    return currentRadius;
}

// Determine quadrant based on x and y coordinates
function getQuadrant(x, y) {
    if (toValence(x) >= 0 && toArousal(y) >= 0) {
        return 'yellow'; // Top-right quadrant
    } else if (toValence(x) < 0 && toArousal(y) >= 0) {
        return 'red'; // Top-left quadrant
    } else if (toValence(x) < 0 && toArousal(y) < 0) {
        return 'grey'; // Bottom-left quadrant
    } else {
        return 'blue'; // Bottom-right quadrant
    }
}

// Function to calculate color based on quadrant
function getColor(x, y) {
    const quadrant = getQuadrant(x, y);
    return quadrantColors[quadrant];
}

// Draw a circular point on the plot
function drawPoint(x,y){
    const radius = calculateRadius();
    const colour = getColor(x, y);

    // Calculate opacity based on the progress of media playback
    const maxOpacity = 0.8;
    const minOpacity = 0.3;
    const progress = elapsedTime / media_duration;
    const currentOpacity = maxOpacity - (maxOpacity - minOpacity) * progress;

    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.globalAlpha = currentOpacity; // Set the opacity
    ctx.fill();
    ctx.globalAlpha = 1; // Reset the opacity
}

// Save data for valence, arousal, timestamp in 2s.f.
function savePoints(x,y){
    valence_points.push(toValence(x).toFixed(2)); 
    arousal_points.push(toArousal(y).toFixed(2));
    time_points.push(elapsedTime.toFixed(2)); 

    console.log("Valence Points:", valence_points);
    console.log("Arousal Points:", arousal_points);
    console.log("Time Points:", time_points);
}

// AutoClicking handler updating x, y coordinates, colour and opacity
function handleMouseMove(event){
    console.log('mousemove event fired');
    
    // Remove the event listener after it's triggered
    canvas.removeEventListener('mousemove', handleMouseMove);

    if (!videoPlayer.paused || !audioPlayer.paused){
        if (event !== null && event.offsetX !== null && event.offsetY !== null) {
            printData(event.offsetX, event.offsetY);        

            if (event.offsetX >= 109.091 && event.offsetX <= 490.09 && event.offsetY >= 109.091 && event.offsetY <= 490.09) {
                
                drawPoint(event.offsetX, event.offsetY);
                savePoints(event.offsetX, event.offsetY);
            } else{
                count_out_of_bounds +=1;
                time_points.push(elapsedTime.toFixed(2)); 
                valence_points.push('Invalid');
                arousal_points.push('Invalid');
                out_of_bounds_lbl.textContent = `You have clicked out of the annotation model ${count_out_of_bounds} times. Do you want to re-annotate?`;
            }           
        }
    }
}

function annotateOnClick(event) {
    console.log('Click event triggered');
    if (!videoPlayer.paused || !audioPlayer.paused){
        
        printData(event.offsetX, event.offsetY); //print x and y coordinates

        /* draw circle for the x and y coordinates when mouse is clicked within the valid area
            when x=-1 -> mouseX=109.09091, x=1 -> mouseX=490.09091
            when y=-1 -> mouseY=490.09091, y=1 -> mouseY=109.09091*/
        if (event !== null && (event.offsetX >= 109.091 && event.offsetX <= 490.09 && event.offsetY >= 109.091 && event.offsetY <= 490.09)) {
            drawPoint(event.offsetX, event.offsetY); // drawPoint(x,y,radius,colour,opacity)
            savePoints(event.offsetX, event.offsetY) // save x,y,time 

            // Call autoclicking every 20ms
            plotInterval =setInterval(() => autoClicking(null), 100);
 
        } else {
            count_out_of_bounds +=1;   
            time_points.push(elapsedTime.toFixed(2)); 
            valence_points.push('Invalid');
            arousal_points.push('Invalid');
            out_of_bounds_lbl.textContent = `You have clicked out of the annotation model ${count_out_of_bounds} times. Do you want to re-annotate?`;
            plotInterval =setInterval(() => autoClicking(null), 100);
        }
    } 
}

function autoClicking(){
    console.log('Auto Click event triggered');
    if (!videoPlayer.paused || !audioPlayer.paused){
        canvas.addEventListener('mousemove', handleMouseMove);
    } else if (videoPlayer.ended || audioPlayer.ended){
        clearInterval(plotInterval);
    } else{
        clearInterval(plotInterval);
        out_of_bounds_lbl.innerHTML = "Paused the media file? To resume annotating, play the media and click on the plot. <br><br> Or, Restart from the beginning with the 'Re-annotate' button below.";
    }
}

// Retrieve the canvas element
var canvas = document.getElementById('2dCanvas');
var ctx = canvas.getContext('2d');

let videoPlayer = document.getElementById('video');
let audioPlayer = document.getElementById('audio');
var out_of_bounds_lbl =document.getElementById('update-note');

// Set the canvas size
canvas.width = 600;
canvas.height = 600;

// Set the canvas size and plot boundaries
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const plotMin = -1.1;
const plotMax = 1.1;
const gridStep = 0.25;
const plotRectRatio = 0.7; // Percentage of canvas size for the inner rectangle

// Initialize new arrays to store Valence, Arousal, and timestamps data
var valence_points = [];
var arousal_points = [];
var time_points = [];
var count_out_of_bounds=0;

var plotInterval;

// Define quadrant colors
const quadrantColors = {
    red: '#ff3333',
    grey: '#94b8b8',
    blue: '#0040ff',
    yellow: '#e6e600'
};

setupMediaControls(videoPlayer,audioPlayer);


// Add an event listener to the canvas element to capture mouse movement
canvas.addEventListener('click', annotateOnClick);

// Call the drawPlot function initially
drawPlot();


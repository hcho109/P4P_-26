const myForm = document.getElementById("form");
const csvFile = document.getElementById("file");
const tableContainer = document.getElementById("csv-table-container");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

var valence_arr = [];
var arousal_arr = [];
var time_arr = [];
var currentPage = 0; // Track the current page of 10 rows

// Define array at a higher scope
var array = [];

// Function to process CSV data
function processCSV() {
    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        array = csvToArray(text);

        for (let i = 1; i < array.length; i++) {
            const values = array[i];
            if (values.length >= 3) {
                const time = parseFloat(values[0].trim());
                const valence = parseFloat(values[1].trim());
                const arousal = parseFloat(values[2].trim());

                valence_arr.push(valence);
                arousal_arr.push(arousal);
                time_arr.push(time);
            }
        }

        // Create the HTML table
        createCSVTable(array);

        // Display or do something with valence_arr, arousal_arr, and time_arr
        console.log("Valence:", valence_arr); // Debugging
        console.log("Arousal:", arousal_arr); // Debugging
        console.log("Time:", time_arr); // Debugging

        imageToHide.style.display = "none";
    };

    reader.readAsText(input);
}

// Add event listener to the submit button
document.getElementById("submit_btn").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
    processCSV(); // Call the function to process the CSV
    document.getElementById("outputText").textContent = "CSV upload complete!!!!!"; 

});


function csvToArray(str, delimiter = ",") {
    const lines = str.split("\n");
    var array = lines.map(line => line.split(delimiter).map(cell => cell.replace(/"/g, '')));
    console.log("Array: ", array); // Debugging
    return array;
}

// Function to create and populate the HTML table with 10 rows per page
function createCSVTable(data) {
    const table = document.createElement("table");
    table.id = "csv-table";

    const startIndex = currentPage * 10;
    const endIndex = Math.min(startIndex + 10, data.length);

    // Create the header row
    const headers = data[0];
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    for (let i = startIndex + 1; i < endIndex; i++) { // Start from index 1 to skip the header row
        const rowData = data[i];
        const row = document.createElement("tr");

        rowData.forEach(cellText => {
            const cell = document.createElement("td");
            cell.textContent = cellText;
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    // Clear previous table (if any) and append the new one to the container
    tableContainer.innerHTML = "";
    tableContainer.appendChild(table);

    // Display the navigation buttons
    prevButton.style.display = "block";
    nextButton.style.display = "block";

    // Update navigation buttons based on the current page
    updateNavigationButtons();
}



// Event listener for the "Next" button
nextButton.addEventListener("click", function () {
    if ((currentPage + 1) * 10 < time_arr.length) {
        currentPage++;
        createCSVTable(array); // Use the correct variable name here
    }
});

// Event listener for the "Previous" button
prevButton.addEventListener("click", function () {
    if (currentPage > 0) {
        currentPage--;
        createCSVTable(array); // Use the correct variable name here
    }
});

function hideImage() {
    // Locate the image element by its id
    let imageElement = document.getElementById("hide_image");
    
    // Set the "hidden" attribute to hide the image
    imageElement.setAttribute("hidden", "hidden");
}

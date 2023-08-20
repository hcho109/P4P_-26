const myForm = document.getElementById("form");
const csvFile = document.getElementById("file");

var valence_arr = [];
var arousal_arr = [];

// Function to process CSV data
function processCSV() {
    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        var array = csvToArray(text);

        for (let i = 1; i < array.length; i++) {
            const values = array[i];
            if (values.length >= 3) {
                const time = parseFloat(values[0].trim());
                const valence = parseFloat(values[1].trim());
                const arousal = parseFloat(values[2].trim());

                valence_arr.push(valence);
                arousal_arr.push(arousal);
            }
        }

        // Display or do something with valence_arr and arousal_arr
        console.log("Valence:", valence_arr); //debugging
        console.log("Arousal:", arousal_arr); //debugging
    };

    reader.readAsText(input);
}

// Add event listener to the submit button
myForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
    processCSV(); // Call the function to process the CSV
});

function csvToArray(str, delimiter = ",") {
    const lines = str.split("\n");
    var array = lines.map(line => line.split(delimiter).map(cell => cell.replace(/"/g, '')));
    console.log("Array: ", array); //debugging
    return array;
}
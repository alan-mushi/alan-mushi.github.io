var N = 10;
// Array filled with N values at '0'
var zero_array = [];

for (i = 0; i < N; i++)
    zero_array.push(0);

// The data of the chart, describe the differents sets of data you want with points, colors...
var data = {
        labels: zero_array,
        datasets:  [
            {
                label: "DataSet #1", // Name of the line
                data: zero_array, // data to represent
                // The following makes the line way less ugly
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)"
            }
        ]
};

// We wait for everything to be loaded
window.onload = function main() {

    // Get the context of the canvas
    var ctx = document.getElementById("line_example").getContext("2d");

    // Create the Chart object
    var line_example_chart = new Chart(ctx).Line(data);

    // Used for the labels on the X axis
    var label_idx = 1;

    // Function to execute to remove then add a new random value to the chart
    function rand_value() {
        // Generate a random integer
        var rand_val = Math.floor(Math.random() * 100);

        // Remove the point at the far left of the chart
        line_example_chart.removeData();
        
        // Add the random value at the far right of the chart
        line_example_chart.addData([rand_val], label_idx++);
    }
    // Run rand_value() every 2 seconds
    window.setInterval(rand_value, 2000);
}
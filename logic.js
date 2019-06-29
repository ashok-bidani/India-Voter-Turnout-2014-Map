// Define width and height of the svg element
var width = 1200;
var height = 600;
        
//Define map projection
var projection = d3.geoMercator().translate([-700, 700]).scale(1000);

//Define path generator
var path = d3.geoPath().projection(projection);
            
// Add the SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// Add color scale and labels for legend
var colorDomain = [58, 66, 74, 82]
var extendedDomain = [50, 58, 66, 74, 82]
var legendLabels = ["50-58%", "58-66%", "66-74%", "74-82%", "Over 82%"]
var color = d3.scaleThreshold()
                .domain(colorDomain)
                .range(["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"]);

// Add tooltip
var div = d3.select("body").append("div")
            .attr("class", "tooltip")

// If loading only parliamentary constituency background map
/*d3.json("data/india_pc_map_2014_merged.geojson").then(function(data) {
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
})*/

// Draw choropleth map in single function. First load voter turnout data
d3.csv("data/india_pc_voter_turnout_2014.csv").then(function(data) {
            
    // Load GeoJSON data of parliamentary constituencies (PC's)
    d3.json("data/india_pc_map_2014_merged.geojson").then(function(json) {
            
        // Bind GeoJSON data to voter turnout data
        for (var i = 0; i < data.length; i++) {
            var dataState = data[i].state;
            var dataPCNo = data[i].pcNo;
            var dataPCName = data[i].pcName;
            var dataValue = parseFloat(data[i].voterTurnout);
            for (var j = 0; j < json.features.length; j++) {
				var jsonState = json.features[j].properties.state;
                var jsonPCNo = json.features[j].properties.pc;
				if (dataState == jsonState && dataPCNo == jsonPCNo) {
                    json.features[j].properties.voterTurnout = dataValue;
                    json.features[j].properties.pcName = dataPCName;
                    break;
				}
            }		
        }
        
        // Draw the map
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d) {
                var value = d.properties.voterTurnout;
                if (value) {return color(value); } else {return "#ccc"; }
            })
            .style("opacity", 0.7)
        
            // Mouse events
            .on("mouseover", function(d) {
                d3.select(this).style("opacity", 1);
                div.text(d.properties.pcName + ": " + d.properties.voterTurnout)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY -30) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).style("opacity", 0.7);
            });
                
    });
});

var legend = svg.selectAll ("g.legend")
                .data(extendedDomain)
                .enter()
                .append("g")
                .attr("class", "legend");

var legendSquare = 20;

legend.append("rect")
    .attr("x", width - 100)
    .attr("y", function(d, i) {return height - (i*legendSquare) - 2*legendSquare; })
    .attr("width", legendSquare)
    .attr("height", legendSquare)
    .style("fill", function(d) {return color(d); })
    .style("opacity", 0.7);

legend.append("text")
    .attr("x", width - 70)
    .attr("y", function(d, i) {return height - (i*legendSquare) - legendSquare - 4; })
    .text(function(d, i) {return legendLabels[i]; });
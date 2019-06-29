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
var color_domain = [58, 66, 74, 82]
var legend_labels = ["50-58%", "58-66%", "66-74%", "74-82%", "Over 82%"]
var color = d3.scaleThreshold()
                .domain(color_domain)
                .range(["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"]);
        
/*d3.json("data/india_pc_map_2014_merged.geojson").then(function(data) {
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
})*/

// Draw choropleth map in single function. First load voter turnout data
d3.csv("data/india_pc_voter_turnout_2014.csv").then(function(data) {
            
    // Load GeoJSON data
    d3.json("data/india_pc_map_2014_merged.geojson").then(function(json) {
            
        // Bind GeoJSON data to voter turnout data
        for (var i = 0; i < data.length; i++) {
            var dataState = data[i].state;
            var dataPCNo = data[i].pcNo;
            var dataValue = parseFloat(data[i].voterTurnout);
            for (var j = 0; j < json.features.length; j++) {
				var jsonState = json.features[j].properties.state;
                var jsonPCNo = json.features[j].properties.pc;
				if (dataState == jsonState && dataPCNo == jsonPCNo) {
				    json.features[j].properties.voterTurnout = dataValue;
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
            .style("opacity", 0.8);
                
    });
});
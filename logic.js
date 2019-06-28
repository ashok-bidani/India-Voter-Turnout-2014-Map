// Define width and height of the svg element
        var width = 960;
        var height = 500;
        
        //Define map projection
        var projection = d3.geoAlbersUsa()
				            .translate([width/2, height/2])
                            .scale([960]);

        //Define path generator
        var path = d3.geoPath().projection(projection);
        
        // Create color scale with 5 buckets for creating choropleth map (taken from ColorBrewer)
        var color = d3.scaleQuantize().range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
        
        // Add the SVG element
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);
        
        // Load CSV data from the US Department of Agriculture, then set input domain for color scale and begin working with GeoJSON data within this function
        d3.csv("us-ag-productivity.csv").then(function(data) {
            color.domain([
                d3.min(data, function(d) {return d.value; }),
                d3.max(data, function(d) {return d.value; })
            ]);
            
            // Load GeoJSON data. Here we will merge the agricultural data into the GeoJSON, because we can only bind one set of data to elements at a time. Hence, we will bind all the data at the same time
            d3.json("us-states.json").then(function(json) {
            
                // For each state, find the GeoJSON element with the same name. Then take that state's data value and place it under json.features[j].properties.value
                for (var i = 0; i < data.length; i++) {
				    var dataState = data[i].state;
				    var dataValue = parseFloat(data[i].value);
				    for (var j = 0; j < json.features.length; j++) {
				        var jsonState = json.features[j].properties.name;
				        if (dataState == jsonState) {
				            json.features[j].properties.value = dataValue;
				            break;
				        }
				    }		
				}
                
                // Lastly, create the paths with a dynamic style: state color is based off of the agricultural data. If no value exists, the area is given a color of light gray ("#ccc")
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", function(d) {
                        var value = d.properties.value;
                        if (value) {return color(value); } else {return "#ccc"; }
                    });
                
                // Load in US cities data. Create a circle element for each city and position according to city's geocoordinates (latitude, longitude)
                d3.csv("us-cities.csv").then(function(data) {
                    svg.selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {return projection([d.lon, d.lat])[0]; })
                        .attr("cy", function(d) {return projection([d.lon, d.lat])[1]; })
                        .attr("r", function(d) {return Math.sqrt(parseInt(d.population) * 0.00004); })
                        .style("fill", "yellow")
                        .style("opacity", 0.75);
                });
            });
        });
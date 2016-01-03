(function() {
  var slider = $('#station-plot-year')[0];
  noUiSlider.create(slider, {
    start: [ 1950, 2010 ], // Handle start position
    step: 10, // Slider moves in increments of '10'
    margin: 20, // Handles must be more than '20' apart
    connect: true, // Display a colored bar between the handles
    orientation: 'horizontal', // Orient the slider vertically
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    tooltips: [wNumb({decimals: 0}), wNumb({decimals:  0})],
    range: { // Slider can select '0' to '100'
      'min': [1800],
      'max': [2050]
    }
    // pips: {
    //   mode: 'range',
    //   density: 3
    // }
  });

  slider.noUiSlider.on('set', function( values, handle ) {
    stationPlotVue.$data.range = _.map(values, Number);
  });

  function plotSeries(data) {
    $("#station-plot svg").empty();
    var margin = {top: 40, right: 40, bottom: 40, left: 40};
    var width = $("#station-plot svg").width() - margin.left - margin.right;
    var height = $("#station-plot svg").height() - margin.top - margin.bottom;

    var x = d3.scale.linear()
          .domain(d3.extent(_.pluck(data, 'year')))
          .range([0, width]);

    var y = d3.scale.linear()
          .domain(d3.extent(_.pluck(data, 'waterlevel')))
          .range([height, 0]);

    var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(3)
          .tickSize(-width)
          .tickFormat(d3.format(".0f"));

    var yAxis = d3.svg.axis()
          .scale(y)
          .ticks(3)
          .tickSize(-width)
          .orient("left");


    var line = d3.svg.line()
          .defined(function(d) {
            return d.waterlevel;
          })
          .x(function(d) {
            return x(d.year);
          })
          .y(function(d) {
            return y(d.waterlevel);
          });

    var area = d3.svg.area()
          .x(function(d) { return x(d.year); })
          .y0(function(d) { return y(d['confidence.lwr']); })
          .y1(function(d) { return y(d['confidence.upr']); });


    function zoomed() {
      svg.select(".x.axis").call(xAxis);
      svg.select(".y.axis").call(yAxis);
      svg.select("path.area").attr("d", area);
      svg.select("path.line").attr("d", line);
    }

    var zoom = d3.behavior.zoom()
          .x(x)
          .y(y)
          .on("zoom", zoomed);

    var svg = d3.select("#station-plot").select("svg")
          .datum(data)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
      .call(zoom);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("path")
      .attr("class", "line")
      .attr("d", line);

    svg.append("path")
      .datum(data.filter(function(d) { return d['confidence.lwr']; }))
      .attr("class", "area")
      .attr("d", area);

  }

  stationPlotVue.$watch('series', function(val) {
    plotSeries(val);
  });
}());

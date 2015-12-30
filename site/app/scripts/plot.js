(function() {
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
          .orient("bottom");

    var yAxis = d3.svg.axis()
          .scale(y)
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

    var svg = d3.select("#station-plot").select("svg")
          .datum(data)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
      .attr("d", function(d) {
        return d3.svg.area()
          .x(function(d) { return x(d.year); })
          .y0(function(d) { return y(d['confidence.lwr']); })
          .y1(function(d) { return y(d['confidence.upr']); })
        (d);
      });

  }

  stationPlotVue.$watch('series', function(val) {
    console.log('new series, plotting', val);
    plotSeries(val);
  });
}());

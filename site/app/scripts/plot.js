/* global stationPlotVue */
(function() {
  'use strict';

  var slider = $('#station-plot-year')[0];
  noUiSlider.create(slider, {
    start: [1950, 2010], // Handle start position
    step: 10, // Slider moves in increments of '10'
    margin: 20, // Handles must be more than '20' apart
    connect: true, // Display a colored bar between the handles
    orientation: 'horizontal', // Orient the slider vertically
    behaviour: 'tap-drag', // Move handle on tap, bar is draggable
    tooltips: [wNumb({decimals: 0}), wNumb({decimals: 0})],
    range: { // Slider can select '0' to '100'
      'min': [1800],
      'max': [2050]
    }
    // pips: {
    //   mode: 'range',
    //   density: 3
    // }
  });

  function plotSeries(data) {
    $('#station-plot svg').empty();
    var marginPx = 40;
    var margin = {
      top: marginPx,
      right: marginPx,
      bottom: marginPx,
      left: marginPx
    };
    var width = $('#station-plot svg').width() - margin.left - margin.right;
    var height = $('#station-plot svg').height() - margin.top - margin.bottom;

    var xExtent = d3.extent(_.pluck(data, 'year'));

    var yExtent = d3.extent(_.pluck(data, 'waterlevel'));

    var x = d3.scale.linear()
          .domain(xExtent)
          .range([0, width]);

    var y = d3.scale.linear()
          .domain(yExtent)
          .range([height, 0]);

    var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .ticks(3)
          .tickSize(-width)
          .tickFormat(d3.format('.0f'));

    var yAxis = d3.svg.axis()
          .scale(y)
          .ticks(3)
          .tickSize(-width)
          .orient('left');

    var waterlevel = d3.svg.line()
          .defined(function(d) {
            return d.waterlevel !== null;
          })
          .x(function(d) {
            return x(d.year);
          })
          .y(function(d) {
            return y(d.waterlevel);
          });

    var fit = d3.svg.line()
          .defined(function(d) {
            return d['confidence.fit'] !== null;
          })
          .x(function(d) {
            return x(d.year);
          })
          .y(function(d) {
            return y(d['confidence.fit']);
          });

    var area = d3.svg.area()
          .x(function(d) { return x(d.year); })
          .y0(function(d) { return y(d['confidence.lwr']); })
          .y1(function(d) { return y(d['confidence.upr']); });

    var svg = d3.select('#station-plot').select('svg')
          .datum(data)
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    function zoomed() {
      svg.select('.x.axis').call(xAxis);
      svg.select('.y.axis').call(yAxis);
      svg.select('path.area').attr('d', area);
      svg.select('path.waterlevel').attr('d', waterlevel);
      svg.select('path.fit').attr('d', fit);
    }

    var zoom = d3.behavior.zoom()
          .x(x)
          .y(y)
          .on('zoom', zoomed);

    svg
      .call(zoom);

    svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', x(xExtent[0]))
      .attr('y', y(yExtent[1]))
      .attr('width', x(xExtent[1]) - x(xExtent[0]))
      .attr('height', y(yExtent[0]) - y(yExtent[1]));

    svg.append('rect')
      .attr('width', width)
      .attr('height', height);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    svg.append('path')
      .attr('class', 'waterlevel line')
      .attr('d', waterlevel);

    svg.append('path')
      .attr('class', 'fit line')
      .attr('d', fit);

    svg.append('path')
    // ignore if we don't have a confidence interval
      .datum(data.filter(function(d) { return d['confidence.lwr']; }))
      .attr('class', 'area')
      .attr('d', area);

  }

  // events
  // if range updates, pass to vue
  slider.noUiSlider.on('set', function(values) {
    stationPlotVue.$set('options.range', _.map(values, Number));
  });

  // if checkbox is selected, pass to vue
  _.each(['nodal', 'ib'], function(id) {
    $('#' + id).on('change', function() {
      stationPlotVue.$set('options.' + id, $('#' + id).is(':checked'));
    });
  });

  // if data updates plot
  stationPlotVue.$watch('series', function(val) {
    plotSeries(val);
  });


}());

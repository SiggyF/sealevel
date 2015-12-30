(function() {
  'use strict';
  var map = L.map('map');

  map.setView([51.83, 4.05], 3);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'osm mapbox',
    maxZoom: 18,
    id: 'siggyf.c74e2e04',
    accessToken: 'pk.eyJ1Ijoic2lnZ3lmIiwiYSI6Il8xOGdYdlEifQ.3-JZpqwUa3hydjAJFXIlMA'
  }).addTo(map);

  /* We simply pick up the SVG from the map object */
  var svg = d3.select(map.getPanes().overlayPane).append('svg');

  var filter = [
    '<defs>',
    '<filter id="dropshadow" height="130%">',
    '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/> ',
    '<feOffset dx="2" dy="2" result="offsetblur"/> ',
    '<feMerge> ',
    '<feMergeNode/> <!-- this contains the offset blurred image -->',
    '<feMergeNode in="SourceGraphic"/> ',
    '</feMerge>',
    '</filter>',
    '</defs>'
  ].join('\n');
  $('#map svg').append(filter);
  var g = svg.append('g');

  function projectPoint(x, y) {
    /*jshint validthis:true */
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    // this is bound to d3.geo.path;
    this.stream.point(point.x, point.y);
  }
  var transform = d3.geo.transform({point: projectPoint});
  var path = d3.geo.path().projection(transform);


  d3.json('/data/psmsl/stations.json', function(features) {
    /* Add a LatLng object to each item in the dataset */
    var bounds = path.bounds(features);
    var topLeft = bounds[0];
    var bottomRight = bounds[1];

    var feature = g.selectAll('path')
          .data(features.features)
          .enter()
          .append('path')
          .attr('d', path)
          .on('click', selectStation);

    // Reposition the SVG to cover the features.
    function reset() {
      // Use Leaflet to implement a D3 geometric transformation.
      svg
        .attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px');

      g
        .attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
      feature
        .attr('d', path);

    }
    map.on('viewreset', reset);
    reset();
  });
})();

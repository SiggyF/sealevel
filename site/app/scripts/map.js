(function() {
  'use strict';
  app.addEventListener('dom-change', function() {
    console.log('dom ready', app.$.leafletMap.map);
  });
  window.addEventListener('WebComponentsReady', function() {
    console.log('web components ready', app.$.leafletMap.map);
    // load events are not propagated
    app.$.leafletMap.addEventListener('load', function(evt) {

      var map = app.$.leafletMap.map;
      if ((evt.detail.target == map)) {
        console.log('ok')
      } else {
        return;
      }

      map._initPathRoot();



      /* We simply pick up the SVG from the map object */
      var svg = d3.select(app.$.leafletMap).select('svg');

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
              .attr('d', path);

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
        // force redraw
        map.setZoom(map.zoom);
      });
    });
  });
})();

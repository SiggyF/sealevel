/* exported selectStation */

var stationVue;
var stationPlotVue;

var url = 'http://localhost:6543';

function selectStation(station) {
  'use strict';
  stationVue.$data.station = station;
  stationPlotVue.$data.id = station.id;
  stationPlotVue.$data.station = station.station;
}

function updateStation() {
  'use strict';
  var options = {
    startyear: _.get(stationPlotVue.$data.options.range, 0, 1900),
    endyear: _.get(stationPlotVue.$data.options.range, 1, 2050),
    nodal: stationPlotVue.$data.options.nodal,
    ib: stationPlotVue.$data.options.ib
  };
  console.log('options:', options);

  if (!stationPlotVue.$data.id) {
    return;
  }
  fetch(url + '/stations/' + stationPlotVue.$data.id + '?' + $.param(options))
    .then(function(response) { return response.json(); })
    .then(function(json) {
      stationPlotVue.$data.series = json.records;
    })
    .catch(function(ex) {
      console.log('parsing failed', ex);
    });
}
(function() {
  'use strict';
  stationVue = new Vue({
    el: '#station-info',
    data: {
      station: ''
    }
  });

  stationPlotVue = new Vue({
    el: '#station-plot',
    data: {
      id: null,
      station: {},
      series: {},
      options: {
        range: [],
        nodal: false,
        ib: false
      }
    }
  });

  stationPlotVue.$watch('id', function () {
    updateStation();
  });
  stationPlotVue.$watch('options.range + options.nodal + options.ib', function () {
    updateStation();
  });

}());

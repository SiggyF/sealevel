var stationVue;
var stationPlotVue;
var url = 'http://localhost:6543';

function selectStation(station) {
  stationVue.$data.station = station;
  stationPlotVue.$data.id = station.id;
  stationPlotVue.$data.station = station.station;
}

function updateStation() {
  var options = {
    startyear: _.get(stationPlotVue.$data.range, 0, 1900),
    endyear: _.get(stationPlotVue.$data.range, 1, 2050)
  };
  if (!stationPlotVue.$data.id) {
    return;
  }
  fetch(url + '/stations/' + stationPlotVue.$data.id + '?' + $.param(options))
    .then(function(response) { return response.json()})
    .then(function(json) {
      stationPlotVue.$data.series = json.records;
    })
    .catch(function(ex) {
      console.log('parsing failed', ex)
    });
}
(function() {
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
      range: []
    }
  });

  stationPlotVue.$watch('id', function (id) {
    updateStation();
  });
  stationPlotVue.$watch('range', function (range) {
    updateStation();
  });

}());

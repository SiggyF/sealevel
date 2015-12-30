var stationVue;
var stationPlotVue;
var url = 'http://localhost:6543';

function selectStation(station) {
  stationVue.$data.station = station;
  stationPlotVue.$data.id = station.id;
  stationPlotVue.$data.station = station.station;
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
      series: {}
    }
  });

  stationPlotVue.$watch('id', function (val) {
    fetch(url + '/stations/' + val)
      .then(function(response) { return response.json()})
      .then(function(json) {
        stationPlotVue.$data.series = json.records;
      })
      .catch(function(ex) {
        console.log('parsing failed', ex)
      });
  });

}());

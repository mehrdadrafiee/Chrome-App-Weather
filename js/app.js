angular.module('myApp', [])

.provider("Weather", function() {
  var apiKey = "";

  this.setApiKey = function(key) {
    if(key) this.apiKey = key;
  };

  this.$get = function($http) {
    return {
      //Service object
    }
  };

  this.getUrl = function(type, ext) {
    return "http://api.wunderground.com/api" +
      this.apiKey + "/" + type + "/q/" +
      ext + '.json';
  };

  this.$get = function($q, $http) {
    var self = this;
    return {
      getWeatherForecast: function(city) {
        var d = $q.defer();
        $http({
          method: 'GET',
          url: self.getUrl("forecast", city),
          cache: true
        })
        .success(function(data) {
          d.resolve(data.forecast.simpleforecast);
        })
        .error(function(err) {
          d.reject(err);
        });
        return d.promise;
      }
    }
  }
})

.config(function(WeatherProvider) {
  WeatherProvider.setApiKey('2a4c7304176bded1');
})

.controller('MainCtrl',
  function($scope, $timeout, Weather) {

  //Build the date object
  $scope.weather = {};
  $scope.date = {};

  //Update function
  var updateTime = function() {
    $scope.date.raw = new Date();
    $timeout(updateTime, 1000);
  }
  //Kick off the update function
  updateTime();

  Weather.getWeatherForecast("CA/San_Francisco")
  .then(function(data) {
    $scope.weather.forecast = data;
  });
});

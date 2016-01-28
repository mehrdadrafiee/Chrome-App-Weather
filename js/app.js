angular.module('myApp', ['ngRoute'])

.provider("Weather", function() {
  var apiKey = "";

  this.setApiKey = function(key) {
    if(key) this.apiKey = key;
  };

  this.getUrl = function(type, ext) {
    return "http://api.wunderground.com/api/" +
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

.factory('UserService', function() {
  var defaults = {
    location: 'autoip'
  };

  var service = {
    user: {},
    save: function() {
      sessionStorage.presently =
        angular.toJson(service.user);
    },
    restore: function() {
      //Pull from sessionStorage
      service.user =
        angular.fromJson(sessionStorage.presently) || defaults

      return service.user;
    }
  };
  //Immediately call restore from the session sessionStorage
  //so we have our user data available Immediately
  service.restore();
  return service;
})

.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html',
      controller: 'MainCtrl'
    })
    .when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .otherwise({redirectTo: '/'});
})

.config(function(WeatherProvider) {
  WeatherProvider.setApiKey('2a4c7304176bded1');
})

.controller('MainCtrl',
  function($scope, $timeout, Weather, UserService) {

  //Build the date object
  $scope.weather = {};
  $scope.date = {};
  $scope.user = UserService.user;

  //Update function
  var updateTime = function() {
    $scope.date.raw = new Date();
    $timeout(updateTime, 1000);
  }
  //Kick off the update function
  updateTime();

  Weather.getWeatherForecast($scope.user.location)
  .then(function(data) {
    $scope.weather.forecast = data;
  });
})

.controller('SettingsCtrl',
  function($scope, UserService) {
    $scope.user = UserService.user;

    $scope.save = function() {
      UserService.save();
    }
})

.directive('autoFill', function($timeout) {
  return {
    restrict: 'EA',
    scope: {
      autoFill: '&',
      ngModel: '='
    },
    compile: function(tEle, tAttrs) {
      //Our compile function
      var tplEl = angular.element('<div class="Typeahead">' +
      '<input type="text" autocomplete="off" />' +
      '<ul id="autolist" ng-show="reslist">' +
        '<li ng-repeat="res in reslist" ' +
          '>{{res.name}}</li>' +
      '</ul>' +
      '</div>');
      var input = tplEl.find('input');
      input.attr('type', tAttrs.type);
      input.attr('ng-model', tAttrs.ngModel);
      tEle.replaceWith(tplEl);

      return function(scope, ele, attrs, ctrl) {
        //Our link function
        
      }
    }
  }
})

'use strict';


// Declare app level module which depends on filters, and services
angular.module('atpcms', [
  'ngRoute',
  'ngAnimate', 
  'toaster',
  'atpcms.filters',
  'atpcms.services',
  'atpcms.directives',
  'atpcms.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'UsersCtrl'});
  $routeProvider.otherwise({redirectTo: '/home'});
}]);

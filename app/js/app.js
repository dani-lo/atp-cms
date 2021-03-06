'use strict';


// Declare app level module which depends on filters, and services
angular.module('atpcms', [
  'ngRoute',
  'ngAnimate', 
  'toaster',
  "checklist-model",
  'atpcms.filters',
  'atpcms.services',
  'atpcms.directives',
  'atpcms.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'NavCtrl'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'NavCtrl'});
  $routeProvider.when('/groups', {templateUrl: 'partials/groups.html', controller: 'NavCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'NavCtrl'});
  $routeProvider.when('/logout', {templateUrl: 'partials/logout.html', controller: 'NavCtrl'});
  $routeProvider.otherwise({redirectTo: '/login'});
}]);

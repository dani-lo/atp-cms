'use strict';

/* Controllers */

angular.module('atpcms.controllers', [])
	/******************************************************************************
  	//////////////////////////////////////////// NavCtrl
  	******************************************************************************/
	.controller('NavCtrl', ['$scope', '$rootScope', '$location', 'AppstateSrv', function($scope, $rootScope, $location, AppstateSrv) {
	//
		//$scope.mylocation = $location.path();

		$scope.getscreen = function(screen) {
			$location.url('/' + screen);
		};

		$scope.chekLocation = function(loc) {
		  return $location.path() == loc;
		};

		$scope.checkLoggedin = function() {
		  return AppstateSrv.getParam("loggedin");
		};
		

		var authCheck = function (event) {
		    if(!AppstateSrv.getParam("loggedin")) {
		        //
		        $location.path('/login');
		    };
		};

		authCheck(null);//

		$rootScope.$on("$routeChangeStart", authCheck);
	}])
	/******************************************************************************
  	//////////////////////////////////////////// HomeCtrl
  	******************************************************************************/
	.controller('HomeCtrl', ['AppstateSrv', function(AppstateSrv) {
		//
		if(!AppstateSrv.getParam("loggedin")){
			return false;
		};
	}])
	/******************************************************************************
  	//////////////////////////////////////////// HomeCtrl
  	******************************************************************************/
	.controller('LoginCtrl', [
		'$scope', '$location', 'LoginSrv', 'AppstateSrv', 'toaster',
		function($scope, $location, LoginSrv, AppstateSrv, toaster) {
		//
		$scope.login = {
			u : "",
			p : ""
		};

		$scope.dologin = function() {

			LoginSrv.getLogin($scope.login).success(onLoginSuccess).error(onLoginError);
		};

		var onLoginSuccess = function(data) {
			//
			toaster.pop('success', "success", '<p>Your login was successful</p>', 5000, 'trustedHtml');

			AppstateSrv.setParam('loggedin', true)
			AppstateSrv.setParam('sid', data.sid)

			$location.path("home");
		};

		var onLoginError = function() {
			//
			toaster.pop('error', "error", '<p>Your login was unsuccessful</p>', 5000, 'trustedHtml');
			
		};
	}])
	/******************************************************************************
  	//////////////////////////////////////////// UsersCtrl
  	******************************************************************************/
	.controller('UsersCtrl', ['$scope', 'toaster', 'UsersSrv', 'AppstateSrv', function($scope, toaster, UsersSrv, AppstateSrv) {
		//

		if(!AppstateSrv.getParam("loggedin")){
			return false;
		};

		$scope.users = [
			{
				id : 1,
				name : "John Smith"
			},
			{
				id : 2,
				name : "Mary Sheeps"
			},
			{
				id : 3,
				name : "Skip Prior"
			},
			{
				id : 4,
				name : "Ted Brown"
			}
		]; 

        $scope.addMode = true; 

        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (user) { 
            user.editMode = !user.editMode; 
        }; 

        var getUsersSuccessCallback = function (data, status) { 
            $scope.users = data; 
        }; 

        var successCallback = function (data, status, headers, config) { 
            
            return UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback); 
        }; 

        var successPostCallback = function (data, status, headers, config) { 
        	//
            successCallback(data, status, headers, config).success(function () { 
                $scope.toggleAddMode(); 
                $scope.user = {}; 
            }); 
        }; 

        var errorCallback = function (data, status, headers, config) { 
            //notificationFactory.error(data.ExceptionMessage); 
            //
            //toaster.pop('error', "Error", "<p>There was an error, please try again</p>", 5000, 'trustedHtml');
        }; 

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback); 

        $scope.addUser = function () { 
            UsersSrv.addUser($scope.user).success(successPostCallback).error(errorCallback); 
        }; 

        $scope.deleteUser = function (user) { 
            UsersSrv.deleteUser(user).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateUser = function (user) { 
            UsersSrv.updateUser(user).success(successCallback).error(errorCallback); 
        }; 
	}]);
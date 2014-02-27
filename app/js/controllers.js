'use strict';

/* Controllers */

angular.module('atpcms.controllers', [])
	/******************************************************************************
  	//////////////////////////////////////////// NavCtrl
  	******************************************************************************/
	.controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
	//
		//$scope.mylocation = $location.path();

		$scope.getscreen = function(screen) {
			$location.url('/' + screen);
		};

	$scope.chekLocation = function(loc) {
	  return $location.path() == loc;
	};
	}])
	/******************************************************************************
  	//////////////////////////////////////////// HomeCtrl
  	******************************************************************************/
	.controller('HomeCtrl', [function() {
		//
	}])
	/******************************************************************************
  	//////////////////////////////////////////// HomeCtrl
  	******************************************************************************/
	.controller('LoginCtrl', ['$scope', '$location', 'LoginSrv', function($scope, $location, LoginSrv) {
		//
		$scope.login = {
			u : "",
			p : ""
		};

		$scope.dologin = function() {
			LoginSrv.getLogin($scope.login).success(onLoginSuccess).error(onLoginError);
		};

		var onLoginSuccess = function() {
			//
			alert("suxccess!!")
		};

		var onLoginError = function() {
			//
			alert("erroooorr!!")
		};
	}])
	/******************************************************************************
  	//////////////////////////////////////////// UsersCtrl
  	******************************************************************************/
	.controller('UsersCtrl', ['$scope', 'toaster', 'UsersSrv',  function($scope, toaster, UsersSrv) {
		//

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

        $scope.testNotify = function() {
        	toaster.pop('success', "success", '<ul><li>Render html</li></ul>', 5000, 'trustedHtml');
        	toaster.pop('error', "error", '<ul><li>Render html</li></ul>', 5000, 'trustedHtml');
        	toaster.pop('info', "info", '<ul><li>Render html</li></ul>', 5000, 'trustedHtml');
        	toaster.pop('warning', "warning", '<ul><li>Render html</li></ul>', 5000, 'trustedHtml');
        };

        var getUsersSuccessCallback = function (data, status) { 
            $scope.users = data; 
        }; 

        var successCallback = function (data, status, headers, config) { 
            
            //notificationFactory.success(); 

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
            toaster.pop('error', "Error", "<p>There was an error, please try again</p>", 5000, 'trustedHtml');
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
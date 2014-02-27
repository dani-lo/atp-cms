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
	}]);
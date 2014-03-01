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
	.controller('HomeCtrl', ['$scope', 'AppstateSrv', 'AdvertisersSrv', 'MarketsSrv',function($scope, AppstateSrv, AdvertisersSrv, MarketsSrv) {
		//
		if(!AppstateSrv.getParam("loggedin")){
			return false;
		};

		if(AppstateSrv.getParam("advertisers") === null) {
			//
			AdvertisersSrv
			.getAdvertisers()
			.success(function(advData){
				
				var apiAdvertisers = [];
				
				angular.forEach(advData, function(advertiser){
					//
					MarketsSrv
					.getMarkets(advertiser.advertiserID)
					.success(function(mktData){
						//
						apiAdvertisers.push({advertiser : advertiser, markets : mktData});
						AppstateSrv.setParam("advertisers", apiAdvertisers);
					})
					.error(function(){
						// die silently
					})
				});
			})
			.error(function(){
				//
				alert("error fetching advertisers");
			});
		}
		

/* ---- test fo checklist-model

		$scope.roles = [
		    'guest', 
		    'user', 
		    'customer', 
		    'admin'
		  ];
		  $scope.user = {
		    roles: ['user']
		  };
		  $scope.checkAll = function() {
		    $scope.user.roles = angular.copy($scope.roles);
		  };
		  $scope.uncheckAll = function() {
		    $scope.user.roles = [];
		  };
		  $scope.checkFirst = function() {
		    $scope.user.roles.splice(0, $scope.user.roles.length); 
		    $scope.user.roles.push('guest');
		  };



		  $scope.logUser = function() {
	  		console.log($scope.user)
	  	};
*/ 
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
		
		$scope.advertisers = AppstateSrv.getParam("advertisers");

		$scope.currAdvertisers = {};

		console.log($scope.advertisers)

		$scope.user = {
			email : "",
			permissions : {}
		};

		$scope.useredit = {};

		$scope.users = [
			{
				id : 1,
				email : "JohnSmith@foo.com",
				admin : false,
				permissions : {
					"101" : ["104848"]
				}
			}
		]; 

        $scope.addMode = true; 

        var prepareEdituser = function() {

        	_.each($scope.users, function(user){
        		$scope.useredit[user.id] = {
        			permissions : {},
        			email : user.email,
        			admin : null
        		};
        		angular.forEach($scope.advertisers, function(advertiserObj){
        			
        			$scope.useredit[user.id].permissions[advertiserObj.advertiser.advertiserID] = {};
        			
        			_.each(advertiserObj.markets, function(market){

        				var marketId = market.marketID;

        				if(_.indexOf(user.permissions[advertiserObj.advertiser.advertiserID], marketId) !== -1 || user.permissions[advertiserObj.advertiser.advertiserID] === true){
        					$scope.useredit[user.id].permissions[advertiserObj.advertiser.advertiserID][marketId] = true;
        				} else {
        					$scope.useredit[user.id].permissions[advertiserObj.advertiser.advertiserID][marketId] = false;
        				}
        			});
        		});
        	});
        };

        $scope.userHasMarket = function(user, checkMarket) {

        	var userPermission, hasMarket = false;

        	angular.forEach(user.permissions, function(advertiser){
        		angular.forEach(advertiser, function(market){
        			
        			if(market == checkMarket){
        				hasMarket = true;
        			}
        		})
        	})

        	return hasMarket;
        }

        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (user) { 
        	//$scope.user = user;
            user.editMode = !user.editMode; 
        }; 

        var prepareUserexport = function(user){

        	var exportuser = {};

        	for (var userID in $scope.useredit) {
        		if(userID == user.id) {
        			exportuser = {
        				id : userID,
        				permissions : $scope.useredit[userID].permissions,
        				email : $scope.useredit[userID].email,
        				admin : $scope.useredit[userID].admin
        			}
        			_.clone($scope.useredit[userID]);
        			exportuser.id = user.id;
        		};
        	};

        	console.log(exportuser)

        	for(var advID in exportuser.permissions){
        		
        		var hasAllMarkets = true;

        		angular.forEach($scope.advertisers, function(advertiserObj){

        			if(advertiserObj.advertiser.advertiserID == advID) {
        				//
        				var allmarkets = advertiserObj.markets;
        				
        				angular.forEach(allmarkets, function(market){

        					if(exportuser.permissions[advID][market.marketID] == false){
        						hasAllMarkets = false;
        					};
        				});
        			};
        		});

        		if(hasAllMarkets){
        			//console.log("YES")
        			exportuser.permissions[advID] = true;
        		} else {
        			//console.log("NOPE")
        		}
        	};
        	console.log("---========--- export user --------")
        	console.log(exportuser)
        	return exportuser;
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

        $scope.addUser = function () { 
        	
        	var apiUser = prepareUserexport($scope.user);
        	console.log(apiUser);
            UsersSrv.addUser(apiUser).success(successPostCallback).error(errorCallback); 
        }; 

        $scope.deleteUser = function (user) { 
            UsersSrv.deleteUser(user).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateUser = function (user) { 
        	var apiUser = prepareUserexport(user);
            UsersSrv.updateUser(apiUser).success(successCallback).error(errorCallback); 
        }; 

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback);

        prepareEdituser();
/*
        $scope.$watch("user.permissions.advertiser", function(){
        	alert($scope.user.permissions)
        	if($scope.user.permissions) {
        		alert("change!")
        		$scope.currAdvertisers = "";
        		
        		angular.forEach($scope.user.permissions.advertiser, function(a){
	        		$scope.currAdvertisers += "::" + a;
	        	});
				
	        	$scope.$apply();
        	}
        	
        });
*/
	}]);
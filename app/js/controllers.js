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

		$scope.users = [
			{
				email : "JohnSmith@foo.com",
				permissions : {
					"101" : ["104848"]
				}
			}
		]; 

        $scope.addMode = true; 

        $scope.userHasMarket = function(user, checkMarket) {
        	console.log(user)
        	console.log(checkMarket)
        	var userPermission, hasMarket = false;

        	angular.forEach(user.permissions, function(advertiser){
        		angular.forEach(advertiser, function(market){
        			console.log("---- " + market)
        			if(market == checkMarket){
        				hasMarket = true;
        			}
        		})
        	})

        	return hasMarket;
        }
/*
        $scope.advertiserClick = function(chbox, user) {
        	
        	if(!user){
        		user = $scope.user;
        	};

        	if(user.email == ""){

        	}

        	if(!$scope.currAdvertisers[user.email]){
        		$scope.currAdvertisers[user.id] = "";
        	}
        	var advID = chbox.advertiser.advertiser.advertiserID;

        	if(user.permissions.advertiser == false) {
        		$scope.currAdvertisers[user.id] += "::" + advID;
        	} else {
        		$scope.currAdvertisers = $scope.currAdvertisers[user.id].replace("::" + advID, "");
        		user.permissions[advID] = [];
        	};

        	//$scope.$apply();
        };
*/
        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (user) { 
        	//$scope.user = user;
            user.editMode = !user.editMode; 
        }; 

        var prepareUser = function(user){

        	delete user.permissions.advertiser;

        	for(var advID in user.permissions){
        		var hasAllMarkets = true, 
        			strMarkets = "::" + user.permissions[advID].join("::");

        		console.log(strMarkets)

        		angular.forEach($scope.advertisers, function(advertiserObj){

        			if(advertiserObj.advertiser.advertiserID == advID) {
        				//
        				var allmarkets = advertiserObj.markets;
        				console.log("1")
        				console.log(allmarkets)
        				angular.forEach(allmarkets, function(market){

        					console.log("has market ...... ? " + market.marketName);

        					if(strMarkets.indexOf("::" + market.marketID) === -1){
        						hasAllMarkets = false;
        					};
        				});
        			};
        		});

        		if(hasAllMarkets){
        			console.log("YES")
        			user.permissions[advID] = true;
        		} else {
        			console.log("NOPE")
        		}
        	};
        	
        	return user;
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
        	
        	var apiUser = prepareUser($scope.user);
        	console.log(apiUser);
            UsersSrv.addUser(apiUser).success(successPostCallback).error(errorCallback); 
        }; 

        $scope.deleteUser = function (user) { 
            UsersSrv.deleteUser(user).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateUser = function (user) { 
        	var apiUser = prepareUser(user);
            UsersSrv.updateUser(apiUser).success(successCallback).error(errorCallback); 
        }; 

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback);
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
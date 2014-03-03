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

		authCheck(null);

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
			toaster.pop('success', "success", '<p>Your login was successful</p>', 2000, 'trustedHtml');

			AppstateSrv.setParam('loggedin', true);
			AppstateSrv.setParam('sid', data.sid);

			$location.path("home");
		};

		var onLoginError = function() {
			//
			toaster.pop('error', "error", '<p>Your login was unsuccessful</p>', 2000, 'trustedHtml');
			
		};
	}])
    /******************************************************************************
    //////////////////////////////////////////// HomeCtrl
    ******************************************************************************/
    .controller('LogoutCtrl', ['$location', 'AppstateSrv', function($location, AppstateSrv) {
        //
        AppstateSrv.setParam('loggedin', false);
        AppstateSrv.setParam('sid', null);
        AppstateSrv.setParam('advertisers', null);
        $location.path("login");
        //return false;
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

		$scope.user = {
			email : "",
			admin : false,
			permissions : {}
		};

		$scope.useredit = {};

		$scope.users = [
			{
				id : 1,
				email : "johnsmith@foo.com",
				admin : false,
				permissions : {
					"101" : ["104848"]
				}
			},
			{
				id : 2,
				email : "marybrown@baz.com",
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
        			admin : false
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

        var prepareAdduser = function() {

    		angular.forEach($scope.advertisers, function(advertiserObj){
    			
    			$scope.user.permissions[advertiserObj.advertiser.advertiserID] = {};
    			
    			_.each(advertiserObj.markets, function(market){

    				var marketId = market.marketID;

    				$scope.user.permissions[advertiserObj.advertiser.advertiserID][marketId] = false;
    			});
    		});
    	};

    	var prepareUserexport = function(user, model){

        	var exportuser = {},
				permissionscopy = {};

			if(model) {
				//
				console.log(model)
				for (var userID in model) {
	        		if(userID == user.id) {
	        			exportuser = {
	        				id : userID,
	        				permissions : model[userID].permissions,
	        				email : model[userID].email,
	        				admin : model[userID].admin
	        			};

	        			exportuser.id = user.id;

	        			permissionscopy[userID] = _.clone(model[userID].permissions);
	        		};
	        	};
			} else {
				exportuser = $scope.user;
				permissionscopy = _.clone($scope.user.permissions);
			};
        	
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
    				//
           			exportuser.permissions[advID] = true;

        			if(model){
        				$scope.useredit[exportuser.id].permissions = permissionscopy[exportuser.id];
        			} else {
        				
        			};
        		} else {
        			//
        		};
        	};
        	return exportuser;
        };

        var validateEmail = function(email) { 
		    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return re.test(email);
		} 

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
        	//
        	var apiUser;

        	if(!validateEmail($scope.user.email)){
        		toaster.pop('error', "Error", "<p>Please enter a valid email address</p>", 2000, 'trustedHtml');
        		return false;
        	};

        	apiUser = prepareUserexport($scope.user);

            UsersSrv.addUser(apiUser).success(successPostCallback).error(errorCallback); 
           	_.delay(function(){prepareAdduser()}, 1000);
        }; 

        $scope.deleteUser = function (user) { 
        	//
            UsersSrv.deleteUser(user).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateUser = function (user) { 
        	//
        	var apiUser;

        	if(!validateEmail($scope.useredit[user.id].email)){
        		toaster.pop('error', "Error", "<p>Please enter a valid email address</p>", 2000, 'trustedHtml');
        		return false;
        	};

        	apiUser = prepareUserexport(user, $scope.useredit);

            UsersSrv.updateUser(apiUser).success(successCallback).error(errorCallback); 
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

            user.editMode = !user.editMode; 
        }; 

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback);

        prepareEdituser();

        prepareAdduser();
	}]);
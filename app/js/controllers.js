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
			user_admin : false,
			data : {}
		};

		$scope.useredit = {};

		$scope.users = [];

        $scope.addMode = true; 

        var prepareEditusers = function() {

        	_.each($scope.users, function(user){

                var userdata = user.data;

        		$scope.useredit[user.id] = {
        			data : {},
        			email : user.email,
        			user_admin : user.user_admin
        		};

        		angular.forEach($scope.advertisers, function(advertiserObj){
        			$scope.useredit[user.id].data[advertiserObj.advertiser.advertiserID] = {};

        			_.each(advertiserObj.markets, function(market){

                        var marketId = market.marketID,
                            advertiserID = advertiserObj.advertiser.advertiserID;//$.parseJSON(user.data);

        				if($scope.userHasMarket(user, marketId, advertiserID)){
                            $scope.useredit[user.id].data[advertiserID][marketId] = true;
        				} else {
        					$scope.useredit[user.id].data[advertiserID][marketId] = false;
        				};

        			});
        		});
        	});
        };

        var prepareAdduser = function() {

    		angular.forEach($scope.advertisers, function(advertiserObj){
    			
    			$scope.user.data[advertiserObj.advertiser.advertiserID] = {};
    			
    			_.each(advertiserObj.markets, function(market){

    				var marketId = market.marketID;

    				$scope.user.data[advertiserObj.advertiser.advertiserID][marketId] = false;
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
	        				data : model[userID].data,
	        				email : model[userID].email,
	        				user_admin : model[userID].user_admin ? "1" : "0"
	        			};

	        			exportuser.id = user.id;

	        			permissionscopy[userID] = _.clone(model[userID].data);
	        		};
	        	};
			} else {
				exportuser = $scope.user;
				permissionscopy = _.clone($scope.user.data);
			};
        	
        	for(var advID in exportuser.data){
        		
        		var hasAllMarkets = true, apimarkets = [];

                for(var marketid in exportuser.data[advID]){
                    if(exportuser.data[advID][marketid] == true){
                        apimarkets.push(marketid);
                    }
                };

        		angular.forEach($scope.advertisers, function(advertiserObj){

        			if(advertiserObj.advertiser.advertiserID == advID) {
        				//
        				var allmarkets = advertiserObj.markets;
        				
        				angular.forEach(allmarkets, function(market){

        					if(exportuser.data[advID][market.marketID] == false){
        						hasAllMarkets = false;
        					};
        				});
        			};
        		});

        		if(hasAllMarkets){
    				//
           			exportuser.data[advID] = true;

        			if(model){
        				$scope.useredit[exportuser.id].data = permissionscopy[exportuser.id];
        			} else {
        				//
        			};
        		} else if(apimarkets.length){
        			exportuser.data[advID] = apimarkets;

                    if(model){
                        $scope.useredit[exportuser.id].data = permissionscopy[exportuser.id];
                    } else {
                        //
                    };
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

            prepareEditusers();
        }; 

        var successCallback = function (data, status, headers, config) { 
            
            toaster.pop('success', "Success", "<p>The operation was successful</p>", 2000, 'trustedHtml');
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

            //console.log("PREPARED USER!!!")
            //console.log(apiUser)

            UsersSrv.updateUser(apiUser).success(successCallback).error(errorCallback); 
        };

        $scope.userHasMarket = function(user, checkMarket, parentAdvertiser) {

        	var userPermission, hasMarket = false;

            if(user.data === true || user.data === "true") {
                hasMarket = true;
            } else {
                for(var advertiser in user.data){

                    if(advertiser == parentAdvertiser){
                        if(user.data[advertiser] === true || user.data[advertiser] === "true") {
                            hasMarket = true;
                        } else if(user.data[advertiser]) {
                            angular.forEach(user.data[advertiser], function(market){
                            
                                if(market == checkMarket){
                                    hasMarket = true;
                                };
                            });
                        };
                    };
                };
            };

        	

        	return hasMarket;
        }

        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (user) { 

            user.editMode = !user.editMode; 
        }; 

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback);

        prepareAdduser();
	}]);
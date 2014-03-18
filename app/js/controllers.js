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
	.controller('HomeCtrl', ['$scope', 'AppstateSrv', 'AdvertisersSrv', 'MarketsSrv','GroupsSrv', function($scope, AppstateSrv, AdvertisersSrv, MarketsSrv, GroupsSrv) {
		//
		if(!AppstateSrv.getParam("loggedin")){
			return false;
		};

        $scope.loading = false;

        var loaders = 0,
            addLoader = function(){
                loaders++;
                $scope.loading = true;
            },
            removeLoader = function(){
                if(loaders > 0){
                    loaders--;
                };
                if(loaders === 0){
                    $scope.loading = false;
                };
            };


    	if(AppstateSrv.getParam("advertisers").length == 0) {
        	//
            addLoader();

			AdvertisersSrv
			.getAdvertisers()
			.success(function(advData){
			     
                removeLoader();

				var apiAdvertisers = [];
				
				angular.forEach(advData, function(advertiser){
					//
                    //
                    MarketsSrv.getMarkets(advertiser.advertiserID)
                    .success(function(mktData){
                        //
                        if(AppstateSrv.getParam('superadmin') || _.indexOf(AppstateSrv.getParam('advspermitted'), advertiser.advertiserID) !== -1){
                            //console.log("ADDIT")
                            apiAdvertisers.push({advertiser : advertiser, markets : mktData});
                            AppstateSrv.setParam("advertisers", apiAdvertisers);
                        } else {
                            //
                            //console.log("SKIpIT")
                        }
                    })
                    .error(function(){
                        // die silently
                    });
				});
			})
			.error(function(){
				//
				alert("error fetching advertisers");
			});
		};
        //
        addLoader();

        GroupsSrv.getGroups().success(function(groupsData){
            
            removeLoader();
            //
            AppstateSrv.setParam("groups", groupsData);
        }).error(function(){

            removeLoader();
            alert("error fetching groups")
        });
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

            var user = $scope.login.u;

            $scope.login.u = user;

			LoginSrv.getLogin($scope.login).success(onLoginSuccess).error(onLoginError);
		};

		var onLoginSuccess = function(data) {
			//
			toaster.pop('success', "success", '<p>Your login was successful</p>', 2000, 'trustedHtml');

            AppstateSrv.setParam('advspermitted', data.advertisers);
			
            AppstateSrv.setParam('loggedin', true);
			
            AppstateSrv.setParam('sid', data.sid);
            
            AppstateSrv.setParam('admin',  data.admin === "1" ? true : false);
            
            AppstateSrv.setParam('superadmin', data.super_admin === "1" ? true : false);
            
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
        AppstateSrv.setParam('advertisers', []);
        AppstateSrv.setParam('groups', []);
        AppstateSrv.setParam('superadmin', false);
        AppstateSrv.setParam('admin', false);
        $location.path("login");
        //return false;
    }])
    /******************************************************************************
    //////////////////////////////////////////// UsersCtrl
    ******************************************************************************/
    .controller('GroupsCtrl', ['$scope', 'toaster', 'GroupsSrv', 'AppstateSrv', function($scope, toaster, GroupsSrv, AppstateSrv) {
        //
        //
        if(!AppstateSrv.getParam("loggedin")){
            return false;
        };

        $scope.group = {
            name : ""
        };

        $scope.groupedit = {};

        $scope.groups = [];

        $scope.addMode = true; 

        $scope.loading = false;

        var loaders = 0,
            addLoader = function(){
                //console.log("ADD LOADER")
                loaders++;
                $scope.loading = true;
            },
            removeLoader = function(){
                //console.log("REMOVE LOADER")
                if(loaders > 0){
                    loaders--;
                };
                if(loaders === 0){
                    $scope.loading = false;
                };
            };

        var getGroupsSuccessCallback = function (data, status) { 
            
            $scope.groups = data; 

            removeLoader();

            AppstateSrv.setParam("groups", data);
            //prepareEditusers();
        }; 

        var successCallback = function (data, status, headers, config) { 
            
            toaster.pop('success', "Success", "<p>The operation was successful</p>", 2000, 'trustedHtml');
            //prepareAdduser();
            return GroupsSrv.getGroups().success(getGroupsSuccessCallback).error(errorCallback); 
        }; 

        var successPostCallback = function (data, status, headers, config) { 
            //
            successCallback(data, status, headers, config).success(function () { 
                
                $scope.toggleAddMode(); 
                
                $scope.group = {
                    name : ""
                }; 
                //
            }); 
        }; 

        var errorCallback = function (data, status, headers, config) { 
            
            removeLoader();

            toaster.pop('error', "Error", "<p>There was an error, please try again</p>", 5000, 'trustedHtml');
        }; 

        $scope.addGroup = function () { 
            //
            var group = $scope.group;

            if(group.name == "" || group.name == null || group.length < 1){
                toaster.pop('error', "Error", "<p>Please enter a valid group name</p>", 2000, 'trustedHtml');
                return false;
            };
            
            addLoader();
        
            GroupsSrv.addGroup(group).success(successPostCallback).error(errorCallback); 
        }; 

        $scope.deleteGroup = function (group) { 
            //
            if(!confirm("Are you sure you want to delete group: " + group.name + "? This action can not be undone.")){
                return false;
            };

            addLoader();
        
            GroupsSrv.deleteGroup(group).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateGroup = function (group) { 
            //
            if(group.name == "" || group.name == null || group.length < 1){
                toaster.pop('error', "Error", "<p>Please enter a valid group name</p>", 2000, 'trustedHtml');
                return false;
            };

            addLoader();
        
            GroupsSrv.updateGroup(group).success(successCallback).error(errorCallback); 
        };

        $scope.isSuperadmin = function() {
            //
            return AppstateSrv.getParam("superadmin");
        };

        $scope.isAdmin = function() {
            //
            return AppstateSrv.getParam("admin");
        };

        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (group) { 

            group.editMode = !group.editMode; 
        }; 

        addLoader();

        GroupsSrv.getGroups().success(getGroupsSuccessCallback).error(errorCallback);

        //prepareAdduser();
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
        $scope.availableGroups = AppstateSrv.getParam("groups");
		$scope.useredit = {};
		$scope.users = [];
        $scope.addMode = true; 
        $scope.user = {
            email : "",
            user_admin : false,
            password : "",
            data : {},
            groups : {}
        };
        $scope.loading = false;

        var loaders = 0,
            addLoader = function(){
                //console.log("ADD LOADER")
                loaders++;
                $scope.loading = true;
            },
            removeLoader = function(){
                //console.log("REMOVE LOADER")
                if(loaders > 0){
                    loaders--;
                };
                if(loaders === 0){
                    $scope.loading = false;
                };
            };


        var prepareEditusers = function() {

        	_.each($scope.users, function(user){

                var userdata = user.data;

        		$scope.useredit[user.id] = {
        			data : {},
        			email : user.email,
        			user_admin : user.user_admin,
                    super_admin : user.super_admin,
                    password : user.password,
                    groups : {}
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

                angular.forEach($scope.availableGroups, function(group){
                    //
                    if(_.indexOf(user.groups, group.id) !== -1 || user.super_admin == 1){
                        $scope.useredit[user.id].groups[group.id] = true;
                    } else {
                        $scope.useredit[user.id].groups[group.id] = false;
                    }
                });
        	});
        };

        var prepareAdduser = function() {

            delete $scope.user;

            $scope.user = {
                email : "",
                user_admin : false,
                password : "",
                data : {},
                groups : {}
            };

    		angular.forEach($scope.advertisers, function(advertiserObj){
    			
    			$scope.user.data[advertiserObj.advertiser.advertiserID] = {};
    			
    			_.each(advertiserObj.markets, function(market){

    				var marketId = market.marketID;

    				$scope.user.data[advertiserObj.advertiser.advertiserID][marketId] = false;
    			});
    		});

            angular.forEach($scope.availableGroups, function(groupObj){
                
                $scope.user.groups[groupObj.id] = false;
            });
    	};

    	var prepareUserexport = function(user, model){

        	var exportuser = {},
				permissionscopy = {};
            
			if(model) { 
                // case :: Edit user
				for (var userID in model) {
	        		if(userID == user.id) {
                        //console.log("found user ...")
                        //console.log(model[userID])
	        			exportuser = {
	        				id : userID,
	        				data : model[userID].data,
	        				email : model[userID].email,
                            password : model[userID].password,
	        				user_admin : model[userID].user_admin ? "1" : "0",
                            groups : model[userID].groups
	        			};

	        			exportuser.id = user.id;

	        			permissionscopy[userID] = _.clone(model[userID].data);
	        		};
	        	};
			} else {
                // case :: Add user
				exportuser = user;
				permissionscopy = _.clone(user.data);
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
            
            var tmpgroups = _.clone(exportuser.groups),exportgroups = [];

            if(!model){
                $scope.user.groups = tmpgroups;
            };

            for(var groupObj in tmpgroups) {
                //
                if(tmpgroups[groupObj] == true){
                    exportgroups.push(groupObj);
                } else {
                    //
                }
            };
            if(!exportuser.password || exportuser.password == ""){
                delete exportuser.password;
            };

            exportuser.groups = exportgroups;

        	return exportuser;
        };

        var reduceGroupsToAdmin = function(groups) {

        };

        var validateEmail = function(email) { 
		    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return re.test(email);
		} 

        var getUsersSuccessCallback = function (data, status) { 
            
            $scope.users = data; 

            removeLoader();

            prepareEditusers();
        }; 

        var successCallback = function (data, status, headers, config) { 
            
            toaster.pop('success', "Success", "<p>The operation was successful</p>", 2000, 'trustedHtml');
            
            return UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback); 
        }; 

        var successPostCallback = function (data, status, headers, config) { 
        	//
            successCallback(data, status, headers, config).success(function () {
                
                prepareAdduser();
            }); 
        }; 

        var errorCallback = function (data, status, headers, config) { 
            //
            removeLoader();
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

            addLoader();

            UsersSrv.addUser(apiUser).success(successPostCallback).error(errorCallback); 
        }; 

        $scope.deleteUser = function (user) { 
        	//
            if(!confirm("Are you sure you want to delete user: " + user.email + "? This action can not be undone.")){
                return false;
            };
            
            addLoader();

            UsersSrv.deleteUser(user).success(successCallback).error(errorCallback); 
        }; 

        $scope.updateUser = function (user) { 
        	//
        	var apiUser;

        	if(!validateEmail($scope.useredit[user.id].email)){
        		toaster.pop('error', "Error", "<p>Please enter a valid email address</p>", 2000, 'trustedHtml');
        		return false;
        	};

            addLoader();

        	apiUser = prepareUserexport(user, $scope.useredit);

            UsersSrv.updateUser(apiUser).success(successCallback).error(errorCallback); 
        };

        $scope.userHasGroup= function(user, group){
            //
            return _.indexOf(user.groups, group) !== -1;
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
        };

        $scope.isSuperadmin = function() {
            //
            return AppstateSrv.getParam("superadmin");
        };

        $scope.isAdmin = function() {
            //
            return AppstateSrv.getParam("admin");
        };

        $scope.toggleAddMode = function () { 
            $scope.addMode = !$scope.addMode; 
        }; 

        $scope.toggleEditMode = function (user) { 

            user.editMode = !user.editMode; 
        }; 

        addLoader();

        UsersSrv.getUsers().success(getUsersSuccessCallback).error(errorCallback);

        prepareAdduser();
	}]);
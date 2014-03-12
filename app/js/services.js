'use strict';

/* Services */

var services;

services = angular.module('atpcms.services', []);
// Demonstrate how to register services
// In this case it is a simple value service.
services.value('version', '0.1');

services.factory('LoginSrv', ['$http', function ($http) { 
    
    var url = "http://attribute2.com/api/login";

    return { 
        getLogin: function (login) { 
            return $http.get(url + "?u=" + login.u + "&p=" + login.p); 
        }
    }; 
}]); 

services.service('AppstateSrv', function () { 
    
    this.params = {
        loggedin : false,
        sid : null,
        advertisers : [],
        superadmin : false,
        admin : false,
        groups : []
    };
    this.setParam = function(param, val){
        //
        this.params[param] = val;
    };
    this.getParam = function(param){
        return this.params[param];
    };
}); 

services.factory('UsersSrv', ['$http', 'AppstateSrv', function ($http, AppstateSrv) { 

  	var url = "http://attribute2.com/api/users";

    return { 
        getUsers : function () { 
            return $http.get(url + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        addUser : function (user) { 
            //user.sid = AppstateSrv.getParam("sid");
            return $http.post(url + "?sid=" + AppstateSrv.getParam("sid"), user); 
        }, 
        deleteUser : function (user) { 
            return $http.delete(url + "/" + user.id + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        updateUser : function (user) { 
            //user.sid = AppstateSrv.getParam("sid");
            return $http.put(url + "/" + user.id + "?sid=" + AppstateSrv.getParam("sid"), user); 
        } 
    }; 
}]);

services.factory('GroupsSrv', ['$http', 'AppstateSrv', function ($http, AppstateSrv) { 

    var url = "http://attribute2.com/api/groups";

    return { 
        getGroups : function () { 
            return $http.get(url + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        addGroup : function (group) { 
            //user.sid = AppstateSrv.getParam("sid");
            return $http.post(url + "?sid=" + AppstateSrv.getParam("sid"), group); 
        }, 
        deleteGroup : function (group) { 
            return $http.delete(url + "/" + group.id + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        updateGroup : function (group) { 
            //user.sid = AppstateSrv.getParam("sid");
            return $http.put(url + "/" + group.id + "?sid=" + AppstateSrv.getParam("sid"), group); 
        } 
    }; 
}]);

services.factory('AdvertisersSrv', ['$http', 'AppstateSrv', function ($http, AppstateSrv) { 
    
    var url = "http://attribute2.com/api/get-advertisers";

    return { 
        getAdvertisers: function () { 
            return $http.get(url + "?sid=" + AppstateSrv.getParam("sid")); 
        }
    }; 
}]); 

services.factory('MarketsSrv', ['$http', 'AppstateSrv', function ($http, AppstateSrv) { 
    
    var url = "http://attribute2.com/api/get-markets";

    return { 
        getMarkets: function (advertiser) { 
            return $http.get(url + "?sid=" + AppstateSrv.getParam("sid") + "&advertiser=" + advertiser); 
        }
    }; 
}]); 
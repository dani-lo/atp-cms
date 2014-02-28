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
        advertisers : null
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

  	var url = "/api/users/";

    return { 
        getUsers : function () { 
            return $http.get(url + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        addUser : function (user) { 
            user.sid = AppstateSrv.getParam("sid");
            return $http.post(url, user); 
        }, 
        deleteUser : function (user) { 
            return $http.delete(url + user.id + "?sid=" + AppstateSrv.getParam("sid")); 
        }, 
        updateUser : function (user) { 
            user.sid = AppstateSrv.getParam("sid");
            return $http.put(url + user.id , user); 
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
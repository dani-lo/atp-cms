'use strict';

/* Services */

var services;

services = angular.module('atpcms.services', []);
// Demonstrate how to register services
// In this case it is a simple value service.
services.value('version', '0.1');

services.value('sid', 't3st1ngth3s1d');

services.factory('UsersSrv', ['$http', 'sid', function ($http, sid) { 

  	var url = "/api/users/";

    return { 
        getUsers : function () { 
            return $http.get(url + "?sid=" + sid); 
        }, 
        addUser : function (user) { 
            user.sid = sid;
            return $http.post(url, user); 
        }, 
        deleteUser : function (user) { 
            user.sid = sid;
            return $http.delete(url + user.id + "?sid=" + sid); 
        }, 
        updateUser : function (user) { 
            user.sid = sid;
            return $http.put(url + user.id , user); 
        } 
    }; 
}]);

services.factory('LoginSrv', ['$http', function ($http) { 
    
    var url = "http://attribute2.com/api/login";

    return { 
        getLogin: function (login) { 
            return $http.get(url + "?u=" + login.u + "&p=" + login.p); 
        }
    }; 
}]); 

services.factory('StorageSrv', [function () { 
    // 
}]); 
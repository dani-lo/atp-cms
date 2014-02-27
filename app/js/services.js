'use strict';

/* Services */

var services;

services = angular.module('atpcms.services', []);
// Demonstrate how to register services
// In this case it is a simple value service.
services.value('version', '0.1')

services.factory('UsersSrv',['$http', function ($http) { 

  	var url = "/api/users/";

    return { 
        getUsers : function () { 
            return $http.get(url); 
        }, 
        addUser : function (user) { 
            return $http.post(url, user); 
        }, 
        deleteUser : function (user) { 
            return $http.delete(url + user.Id); 
        }, 
        updateUser : function (user) { 
            return $http.put(url + user.Id, user); 
        } 
    }; 
}]);

services.factory('NotifySrv', function () { 
  
    return { 
        success: function () { 
            toaster.success("Success"); 
        }, 
        error: function (text) { 
            toaster.error(text, "Error!"); 
        } 
    }; 
}); 
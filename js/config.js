'use strict';

var xpLoginApp = angular.module('xpLoginApp');

// NOTE: need to make sure that the file with the Providers we create are 
// including in the index.html script before this file
xpLoginApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'xpAuthPermissionsProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, xpAuthPermissionsProvider) {

    xpAuthPermissionsProvider.setRolesAndAccessLevels();

    var access = xpAuthPermissionsProvider.accessLevels;

    // Public routes
    $stateProvider
      .state('public', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.public
        }
      })
      .state('public.404', {
        url: '/404/',
        templateUrl: 'templates/404.html'
      });

    // Anonymous routes
    $stateProvider
      .state('anon', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.anon
        }
      })
      .state('anon.login', {
        url: '/login/',
        templateUrl: 'templates/login.html',
        controller: 'XpLoginCtrl'
      })
      .state('anon.register', {
        url: '/register/',
        templateUrl: 'templates/register.html',
        controller: 'XpRegisterCtrl'
      });

    // Regular user routes
    $stateProvider
      .state('user', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.user
        }
      })
      .state('user.home', {
        url: '/',
        templateUrl: 'templates/home.html'
      });

    // Admin routes
    $stateProvider
      .state('admin', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.admin
        }
      })
      .state('admin.admin', {
        url: '/admin/',
        templateUrl: 'templates/admin.html',
        controller: 'XpAdminCtrl'
      });


    $urlRouterProvider.otherwise('/404');

    // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
    $urlRouterProvider.rule(function($injector, $location) {
      if ($location.protocol() === 'file') {
        return;
      }

      var path = $location.path();
      // Note: misnomer. This returns a query object, not a search string
      var search = $location.search();
      var params;

      // check to see if the path already ends in '/'
      if (path[path.length - 1] === '/') {
        return;
      }

      // If there was no search string / query params, return with a `/`
      if (Object.keys(search).length === 0) {
        return path + '/';
      }

      // Otherwise build the search string and return a `/?` prefix
      params = [];
      angular.forEach(search, function(v, k) {
        params.push(k + '=' + v);
      });

      return path + '/?' + params.join('&');
    });

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
      return {
        'responseError': function(response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/login');
          }
          return $q.reject(response);
        }
      };
    });
  }
]);

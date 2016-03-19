'use strict';


angular.module('composeUiApp')
  .directive('ngConfirmClick', [
    function () {
      return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || "Are you sure?";
          var clickAction = attr.ngConfirmClick;
          element.bind('click', function (event) {
            if (window.confirm(msg)) {
              console.log('apply');
              scope.$apply(clickAction);
            }
          });
        }
      };
    }]);


angular.module('composeUiApp')
  .directive('projectDetail', function ($resource, $log, projectService, $window, $interval) {
    return {
      restrict: 'E',
      scope: {
        projectId: '=',
        path: '='
      },
      templateUrl: 'views/project-detail.html',
      controller: function ($scope) {

        var Project = $resource('api/v1/projects/:id');
        var Host = $resource('api/v1/host');
        var Yml = $resource('api/v1/projects/yml/:id');
        var refresh = function (val) {
          $log.debug('refresh ' + val);
          Project.get({id: val}, function (data) {
            $scope.services = projectService.groupByService(data);
          }, function (err) {
            alertify.alert(err.data);
          });

          Host.get(function (data) {
            var host = data.host;
            $scope.hostName = host ? host.split(':')[0] : null;
          });
        };

        var stop = $interval(function () {
          refresh($scope.projectId);
        }, 5000);
        console.log('listen destroy');
        $scope.$on('$destroy', function () {
          console.log('destroy');
          $interval.cancel(stop);
        });


        $scope.$watch('projectId', function (val) {
          if (val) {
            refresh(val);
          }
        });

        var Logs = $resource('api/v1/logs/:id/:container/:limit');
        var Action = $resource('api/v1/:action/:id/:container');

        $scope.stopContainer = function (id) {
          Action.get({id: $scope.projectId, action: 'stop', container: id}, function (data) {
            console.log('stop');
          });
        };

        $scope.startContainer = function (id) {
          Action.get({id: $scope.projectId, action: 'start', container: id}, function (data) {
            console.log('start');
          });
        };

        $scope.restartContainer = function (id) {
          Action.get({id: $scope.projectId, action: 'restart', container: id}, function (data) {
            console.log('restart');
          });
        };
        $scope.displayLogs = function (id) {
          Logs.get({id: $scope.projectId, limit: 2000, container: id}, function (data) {
            console.log('get logs', id);
            $scope.containerLogs = id;
            $scope.showDialog = true;
            $scope.logs = data.logs;
          });
        };
        $scope.logsfilter = "";
        $scope.filterByString = function (obj) {
          //console.log(obj, $scope.logsfilter);
          if ($scope.logsfilter == "")
            return true;
          return obj.indexOf($scope.logsfilter) >= 0;
        };

        var stopRefreshLog;
        $scope.$watch('showDialog', function () {
          console.log('show dialog changed', $scope.showDialog);
          if ($scope.showDialog) {
            stopRefreshLog = $interval(function () {
              $scope.displayLogs($scope.containerLogs);
            }, 5000);
          }
          else {
            if (stopRefreshLog)
                $interval.cancel(stopRefreshLog);
          }
        });

        var Service = $resource('api/v1/services', null, {
          scale: {
            method: 'PUT'
          }
        });

        $scope.scale = function (service) {
          var num = $window.prompt('how many instances of service ' + service + '?');

          $scope.working = true;

          Service.scale({service: service, project: $scope.projectId, num: num}, function () {

            Project.get({id: $scope.projectId}, function (data) {
              $scope.services = projectService.groupByService(data);
              $scope.working = false;
            }, function (err) {
              $scope.working = false;
              alertify.alert(err.data);
            });

          }, function (err) {
            $scope.working = false;
            alertify.alert(err.data);
          });
        };


        $scope.isEmpty = function (obj) {
          return angular.equals({}, obj);
        };

        $scope.yml = function () {
          Yml.get({
            id: $scope.projectId
          }, function (data) {
            $scope.ymlData = data.yml;
          });

        };

      }
    };
  });

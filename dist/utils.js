// This part is needed only if you want to provide your own Persistance Implementation
// Angular Module must match "ramlEditorApp"
angular.module('ramlEditorApp')
.factory('MyFileSystem', function ($q, config, $rootScope, $http) {
    var service = {};

service.directory = function (path) {
    var me = this,
        deferred = $q.defer();

    function insertFileTree (data) {
      me.structure = data;
      deferred.resolve(data);
    }

    // Simple GET request example:
    $http({
      method: 'GET',
      url: '/ramlFiles'
    }).then(function successCallback(response) {
      console.log('successCallback response = ', response);
      insertFileTree(response.data);

      // this callback will be called asynchronously
      // when the response is available
    }, function errorCallback(response) {
      console.log('$http.GET(/ramlFiles).then(errorCallback)', arguments);
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
    console.log('service.directory', arguments);

    // Your magic goes here:
    // Do deferred.resolve(data); to fulfull the promise or
    // deferred.reject(error); to reject it.

    return deferred.promise;
    };

service.load = function (path, name) {
    var deferred = $q.defer(),
        ramFiles = this.structure.onlyFiles,
        currentFile = JSON.parse(localStorage.getItem('config.currentFile'));

    ramFiles.forEach(function(item) {
        if (item.path === this.path) {
          deferred.resolve(item.content);
        }
    },currentFile);

    // Your magic goes here:
    // Do deferred.resolve(data); to fulfull the promise or
    // deferred.reject(error); to reject it.

    return deferred.promise;
    };

service.remove = function (path, name) {
    var deferred = $q.defer();
    console.log('service.remove', arguments);
    // Your magic goes here:
    // Do deferred.resolve(data); to fulfull the promise or
    // deferred.reject(error); to reject it.

    return deferred.promise;
    };

service.save = function (path, name, contents) {
    var deferred = $q.defer(),
        requestBody = {
          path: path,
          content: name
        };
    console.log('service.save', arguments);
    deferred.resolve(name);

    $http.post('/saveRamlFile', requestBody)
      .then(function successCallback(response) {
          console.log('successCallback response = ', response);
          insertFileTree(response.data);

          // this callback will be called asynchronously
          // when the response is available
        }, function errorCallback(response) {
          console.log('$http.GET(/ramlFiles).then(errorCallback)', arguments);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    // Your magic goes here:
    // Do deferred.resolve(data); to fulfull the promise or
    // deferred.reject(error); to reject it.

    return deferred.promise;
    };

return service;
})
.run(function (MyFileSystem, config, $rootScope) {
    // Set MyFileSystem as the filesystem to use
    config.set('fsFactory', 'MyFileSystem');
    // In case you want to send notifications to the user
    // (for instance, that he must login to save).
    // The expires flags means whether
    // it should be hidden after a period of time or the
    // user should dismiss it manually.
    $rootScope.$broadcast('event:notification',
      {message: 'File saved.', expires: true});

});

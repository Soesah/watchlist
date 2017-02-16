angular.module('watchlistApp').controller('ViewController', ['$scope', 'ListDataFactory', '$routeParams', '$location',
  function($scope, ListDataFactory, $routeParams, $location) {

    $scope.item = ListDataFactory.getByPath($routeParams.path);

    $scope.getItemViewTemplate = function() {
      switch($scope.item.type) {
        case ListDataFactory.MOVIE:
        case ListDataFactory.SEQUEL:
        case ListDataFactory.PREQUEL:
          return 'app/view/directives/movie-view.html';
        case ListDataFactory.SERIES:
          return 'app/view/directives/series-view.html';
        case ListDataFactory.DOCUMENTARY:
          return 'app/view/directives/documentary-view.html';
        case ListDataFactory.GAME:
          return 'app/view/directives/game-view.html';
      }
    };

    $scope.edit = function() {
      $location.path('/edit/' + $scope.item.path);
    };

    $scope.back = function() {
      $location.path('/');
    };

  }
]);

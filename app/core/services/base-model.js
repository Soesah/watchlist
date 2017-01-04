angular.module('watchlistApp').factory('BaseModel', [
  function() {

  class BaseModel {
    constructor() {
    }

    get path() {
      return this.name.replace(/\W+/g, '-').replace('--', '').toLowerCase() + '-' + this.year;
    }

    isComplete() {
      return this.name && this.year;
    }

    toggleWatched() {
      this.watched = !this.watched;
    }
  }

  return BaseModel;
}]);

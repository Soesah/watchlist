angular.module('watchlistApp').filter('listFilter', ['_', 'ListDataFactory',
  function(_, ListDataFactory) {
    'use strict';
    return function(list, itemType, itemState, itemVerified, filter) {
      return _.filter(list, function(obj) {
        let show = true;

        if (filter) {
          show = obj.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        }

        if (show && itemType !== ListDataFactory.ALL) {
          show = itemType.indexOf(obj.type) !== -1;
        }

        if (show && itemState !== null) {
          show = obj.watched === itemState;
        }

        if (show && itemVerified !== null) {
          show = itemVerified ? obj.imdbId !== null : obj.imdbId === null;
        }

        return show;
      });
    };
  }
]);
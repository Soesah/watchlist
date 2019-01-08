import Vue from 'vue';
import Vuex from 'vuex';
import { getStoreBuilder } from 'vuex-typex';
import watchlistService from '@/services/WatchlistService';
import { WatchlistType } from '@/core/models/BaseModel';
import { Franchise } from '@/models/FranchiseModel';
import { WatchlistItems } from './services/WatchItemFactory';

Vue.use(Vuex);

interface Filter {
  search: string;
  itemState: string | null;
  itemType: string | boolean;
}

interface WatchlistState {
  item: any;
  items: WatchlistItems[];
  messages: any[];
  filter: Filter;
  navigation: any[];
  event: Vue;
}

const storeBuilder = getStoreBuilder<WatchlistState>();

export default new Vuex.Store<WatchlistState>({
  state: {
    item: {},
    items: [],
    messages: [],
    filter: {
      search: '',
      itemState: null,
      itemType: true
    },
    navigation: [],
    // set up a Vue instance as an eventing proxy
    event: new Vue()
  },
  mutations: {
    setItems(state, items) {
      state.items = items;
    },
    setItem(state, item) {
      state.item = item;
    },
    addItem(state, item: any) {
      state.items.push(item);
    },
    editItem(state, item) {
      // assume imdbId doesn't change
      let index = state.items.findIndex((it: any) => it.imdbId === item.imdbId);
      state.items.splice(index, 1, item);
    },
    removeItem(state, item) {
      // assume imdbId doesn't change
      let index = state.items.findIndex((it: any) => it.imdbId === item.imdbId);
      state.items.splice(index, 1);
    },
    removeSeason(_, { item, season }) {
      item.removeSeason(season);
    },
    toggleWatched(_, item) {
      item.toggleWatched();
    },
    toggleSeasonWatched(_, { item, season }) {
      item.toggleSeasonWatched(season);
    },
    toggleEpisodeWatched(_, { item, season, episode }) {
      item.toggleEpisodeWatched(season, episode);
    },
    message(state, message) {
      message.id = message.type + '_' + message.text;
      state.messages.push(message);
      // switch (message.type) {
      //   case 'info':
      //     this.dispatch('dismiss', { delay: 1700, id: message.id });
      //     break;
      //   case 'success':
      //     this.dispatch('dismiss', { delay: 2000, id: message.id });
      //     break;
      //   case 'warning':
      //     this.dispatch('dismiss', { delay: 2500, id: message.id });
      //     break;
      //   case 'error':
      //     // make the user dismiss the error
      //     break;
      // }
    },
    dismiss(state, id) {
      let index = state.messages.findIndex((message: any) => message.id === id);
      state.messages.splice(index, 1);
    },
    addNav(state, nav) {
      state.navigation.push(nav);
    },
    removeNav(state, to) {
      let index = state.navigation.findIndex((nav: any) => nav.to === to);
      state.navigation.splice(index, 1);
    }
  },
  actions: {
    addItem({ commit, dispatch }, item) {
      commit('addItem', item);
      return dispatch('save', 'Saving ' + item.name);
    },
    editItem({ commit, dispatch }, item) {
      commit('editItem', item);
      return dispatch('save', 'Saving changes to ' + item.name);
    },
    removeItem({ commit, dispatch }, item) {
      commit('removeItem', item);
      return dispatch('save', 'Removing ' + item.name);
    },
    removeSeason({ commit, dispatch }, { item, season }) {
      commit('removeSeason', { item, season });
      return dispatch('save', 'Removing ' + item.name + ' Season ' + season.nr);
    },
    toggleWatched({ commit, dispatch }, item) {
      commit('toggleWatched', item);
      return dispatch(
        'save',
        'Setting ' +
          item.name +
          ' to ' +
          (item.watched ? 'watched' : 'not watched')
      );
    },
    toggleSeasonWatched({ commit, dispatch }, { item, season }) {
      commit('toggleSeasonWatched', { item, season });
      return dispatch(
        'save',
        'Setting ' +
          item.name +
          ' Season ' +
          season.nr +
          ' to ' +
          (item.watched ? 'watched' : 'not watched')
      );
    },
    toggleEpisodeWatched({ commit, dispatch }, { item, season, episode }) {
      commit('toggleEpisodeWatched', { item, season, episode });
      return dispatch(
        'save',
        'Setting ' +
          item.name +
          ' Season ' +
          season.nr +
          ' Episode ' +
          episode.nr +
          ' to ' +
          (item.watched ? 'watched' : 'not watched')
      );
    },
    save({ commit, state }, message) {
      commit('message', {
        type: 'info',
        text: message ? message : 'Saving...'
      });
      // return watchlistService.save(state.items).then(items => {
      //   commit('setItems', items);
      //   commit('message', {
      //     type: 'success',
      //     text: 'Watchlist saved succesfully.'
      //   });
      //   return items;
      // });
    },
    getWatchList({ commit }) {
      return watchlistService.load().then(items => commit('setItems', items));
    },
    getItemByName({ commit }, name) {
      return watchlistService.load().then((items: any) => {
        commit('setItems', items);
        let item = items.find((item: any) => item.path === name);
        commit('setItem', item);
        return item;
      });
    },
    dismiss({ commit }, { id, delay }) {
      window.setTimeout(() => {
        commit('dismiss', id);
      }, delay);
    }
  },
  getters: {
    searchItems: state => (search: string, items: any) => {
      return state.items.filter((item: any) => {
        return (
          item.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 &&
          item.type !== WatchlistType.Franchise &&
          !~items.indexOf(item.imdbId)
        );
      });
    },
    franchises: state => (): Franchise[] => {
      return state.items.filter(
        (item: WatchlistItems): item is Franchise =>
          item.type === WatchlistType.Franchise
      );
    },
    getItemFranchise: (_, getters) => (item: any): boolean => {
      return getters
        .franchises()
        .find((franchise: Franchise) => franchise.items.includes(item.imdbId));
    },
    franchiseItems: state => (items: string[]): WatchlistItems => {
      const franchiseItems: any = [];
      items.forEach((imdbId: string) => {
        franchiseItems.push(state.items.find(item => item.imdbId === imdbId));
      });
      return franchiseItems;
    },
    filteredItems: (state, getters) => () => {
      let filtered = state.items.filter((item: any) => {
        let show = true;

        // filter out franchised items by default
        show = !getters.getItemFranchise(item);

        // filter out franchises when searching;
        // this prevents heaps of complexity if you were to extend the filter and search to franchiseItems above
        if (state.filter.search) {
          show =
            item.name
              .toLowerCase()
              .indexOf(state.filter.search.toLowerCase()) !== -1 &&
            item.type !== WatchlistType.Franchise;
        }

        if (show && state.filter.itemType !== true) {
          show = (state.filter.itemType as string).indexOf(item.type) !== -1;
        }

        if (show && state.filter.itemState !== null) {
          show = item.watched === state.filter.itemState;
        }

        return show;
      });
      return filtered;
    }
  }
});

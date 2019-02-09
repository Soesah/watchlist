import Vue from 'vue';
import Vuex from 'vuex';
import { getStoreBuilder } from 'vuex-typex';
import watchlistService from '@/services/WatchlistService';
import { WatchlistType } from '@/core/models/BaseModel';
import { Franchise } from '@/models/FranchiseModel';
import {
  WatchItemFactory,
  WatchlistItems,
  FranchiseItems
} from './services/WatchItemFactory';

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
      state.items = [...state.items, item];
    },
    editItem(state, item) {
      // assume imdbID doesn't change
      let index = state.items.findIndex((it: any) => it.imdbID === item.imdbID);
      state.items.splice(index, 1, item);
    },
    removeItem(state, item) {
      // assume imdbID doesn't change
      let index = state.items.findIndex((it: any) => it.imdbID === item.imdbID);
      state.items.splice(index, 1);
    },
    removeSeason(_, { item, season }) {
      item.removeSeason(season);
    },
    toggleWatched(state, item) {
      let index = state.items.findIndex((it: any) => it.imdbID === item.imdbID);
      state.items.splice(index, 1, item);
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
    async addItem({ commit, dispatch }, item: WatchlistItems) {
      const stored = await watchlistService.create(item);
      if (typeof stored === 'string') {
        return dispatch('error', `Error adding ${item.title}: "${stored}"`);
      } else {
        commit('addItem', stored);
        return dispatch('save', `Adding ${stored.title}`);
      }
    },
    async editItem({ commit, dispatch }, item) {
      const stored = await watchlistService.store(item);
      if (typeof stored === 'string') {
        return dispatch('error', `Error saving ${item.title}: "${stored}"`);
      } else {
        commit('editItem', stored);
        return dispatch('save', `Saving changes to ${stored.title}`);
      }
    },
    async removeItem({ commit, dispatch }, item) {
      const message = await watchlistService.remove(item);
      commit('removeItem', item);
      return dispatch('save', `Removing ${item.title}`);
    },
    removeSeason({ commit, dispatch }, { item, season }) {
      commit('removeSeason', { item, season });
      return dispatch('save', `Removing ${item.title} Season ${season.nr}`);
    },
    async toggleWatched({ commit, dispatch }, item) {
      const update = await watchlistService.toggle(item);
      if (update) {
        commit('toggleWatched', update);
      } else {
        throw new Error('Failed to change item watched status');
      }
      const watched = item.type === WatchlistType.Game ? 'played' : 'watched';
      return dispatch(
        'save',
        `Setting ${item.title} to ${
          update.watched ? watched : 'not ' + watched
        })}`
      );
    },
    async toggleSeasonWatched({ commit, dispatch }, { item, season }) {
      const update = await watchlistService.toggleSeason(item, season);
      if (update) {
        commit('toggleWatched', update);
        commit('setItem', update);
      } else {
        throw new Error('Failed to change item watched status');
      }
      return dispatch(
        'save',
        `Setting ${item.title} Season ${season.nr} to ${
          !season.watched ? 'watched' : 'not watched'
        }`
      );
    },
    async toggleEpisodeWatched(
      { commit, dispatch },
      { item, season, episode }
    ) {
      const update = await watchlistService.toggleEpisode(
        item,
        season,
        episode
      );
      if (update) {
        commit('toggleWatched', update);
        commit('setItem', update);
      } else {
        throw new Error('Failed to change item watched status');
      }
      return dispatch(
        'save',
        `Setting ${item.title} Season ${season.nr} Episode ${episode.nr} to ${
          !episode.watched ? 'watched' : 'not watched'
        }`
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
    async getItemByPath({ commit }, path) {
      const items = await watchlistService.load();
      commit('setItems', items);
      let item = items.find((item: any) => item.path === path);
      commit('setItem', item);
      return item;
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
          item.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 &&
          item.type !== WatchlistType.Franchise &&
          !~items.indexOf(item.imdbID)
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
        .find((franchise: Franchise) => franchise.items.includes(item.imdbID));
    },
    franchiseItems: state => (items: string[]): FranchiseItems[] => {
      return items.map((imdbID: string) =>
        state.items.find(item => item.imdbID === imdbID)
      );
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
            item.title
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

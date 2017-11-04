import WatchItemFactory from 'services/WatchItemFactory';

let WatchItemView = Vue.component('watch-item-view', {
  template:`<div class="view">
              <h2 v-text="item.name"></h2>

              <h3>
                <span v-text="item.year"></span><span v-show="item.lastYear"> – <span v-text="item.lastYear"></span></span><span v-show="item.finished" class="bracketed">Finished</span>
                <span v-text="typeName"></span>
                <span v-show="item.imdbId" class="dashed"><a :href="'http://www.imdb.com/title/' + item.imdbId" target="_new">IMDB</a></span>
              </h3>

              <div class="actors" v-show="item.actors && item.actors.length">
                <h4>Actors</h4>
                <ul>
                  <li v-for="actor in item.actors" v-text="actor"></li>
                </ul>
              </div>

              <!--ng-include v-show="item" src="getItemViewTemplate()"></ng-include-->


              <div class="links">
                <router-link :to="'/edit/' + item.path">Edit</router-link> / 
                <a href="#" @click="back">Back</a>
              </div>
            </div>`,
  computed: {
    item() {
      return this.$store.state.item
    },
    typeName() {
      return WatchItemFactory.getTypeName(this.item);
    }
  },
  created () {
    this.$store.dispatch('getItemByName', this.$route.params.path);
  },
  methods: {
    back(evt) {
      this.$router.go(-1);
      evt.preventDefault();
    }
  }
});
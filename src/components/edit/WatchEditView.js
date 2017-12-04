import WatchItemFactory from 'services/WatchItemFactory';
import ItemFields from 'components/common/item-fields/ItemFields';
import ConfirmDeleteModal from 'components/edit/ConfirmDeleteModal';

let WatchEditView = Vue.component('watch-edit-view', {
  template:`<form class="form" @submit="edit">
              <h2>Edit</h2>
              <p>Update and complete the information for this <span v-text="getTypeName(item)"></span></p>

              <item-fields :state-item="stateItem" v-model="item"></item-fields>

              <div class="buttons">
                <button type="submit">Edit</button>
                <button type="button" class="danger" @click="remove">Delete</button>
                <button type="cancel" @click="back">Cancel</button>
              </div>
            </form>`,
  data() {
    return {
      item: WatchItemFactory.new()
    }
  },
  computed: {
    // needed to listen to state's item
    stateItem() {
      let item = WatchItemFactory.new();
      if (this.$store.state.item.name) {
        item = this.$store.state.item.clone();
        // set this item as the data item, to allow mutation
        this.item = item;
      }
      return item;
    }
  },
  created () {
    this.$store.dispatch('getItemByName', this.$route.params.path).then(item => {
      this.$store.commit('addNav', {
        name: 'Edit ' + item.name,
        to: '/edit/' + item.path
      });
    });
  },
  destroyed () {
    this.$store.commit('removeNav', '/edit/' + this.item.path);
  },
  methods: {
    edit (evt) {
      this.$store.dispatch('editItem', this.item)
        .then(items => this.$router.go(-1));
      evt.preventDefault();
    },
    remove (evt) {
      this.$store.state.event.$emit('openModal', {
        modal: 'confirm-delete-modal',
        name: this.item.name,
        confirm: this.onConfirmDelete
      });

      evt.preventDefault();
    },
    onConfirmDelete () {
      this.$store.dispatch('removeItem', this.item)
        .then(items => {
          this.$destroy();
          this.$router.push('/');
        });
    },
    back (evt) {
      this.$router.go(-1);
      evt.preventDefault();
    },
    getTypeName(item) {
      return WatchItemFactory.getTypeName(item).toLowerCase();
    } 
  },
  components: {
    ItemFields,
    ConfirmDeleteModal
  }
});
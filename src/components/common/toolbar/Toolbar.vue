<template>
  <nav class="toolbar">
    <slot></slot>
    <ul>
      <li>
        <router-link to="/add" active-class="active">Add</router-link>
      </li>
      <li>
        <router-link to="/franchises" exact active-class="active">Franchises</router-link>
      </li>
      <li v-for="nav in navigation" :key="nav.to">
        <router-link :to="nav.to" exact active-class="active" v-text="nav.name"></router-link>
      </li>
    </ul>
    <router-link to="/settings" class="settings-button" active-class="active">
      <i class="icon icon-cog"></i>
    </router-link>
    <version></version>
  </nav>
</template>
<script lang="ts">
import Vue from "vue";
import Version from "@/components/common/version/Version.vue";
import { mapState } from "vuex";

export default Vue.extend({
  name: "Toolbar",
  computed: {
    ...mapState(["navigation"])
  },
  components: {
    Version
  }
});
</script>

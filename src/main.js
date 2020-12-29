import { createApp } from 'vue';
import App from './App.vue';
import store from './store';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSlidersH, faLayerGroup, faSave, faPrint, faInfoCircle, faTree } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faSlidersH, faLayerGroup, faSave, faPrint, faInfoCircle, faTree);

createApp(App)
  .use(store)
  .component('font-awesome-icon', FontAwesomeIcon)
  .mount('#app');

<template>
  <div class="app-settings">
    <h1>Settings</h1>
    <Settings class="block" />

    <h1>Layers</h1>
    <Layers class="block" />

    <h1>Wood types</h1>
    <Wood class="block" />

    <h1>Save / load</h1>
    <div class="loadSave block">
      <p>
        Below you can download the current settings or load them again from a file. You can also bookmark the current page or copy the URL from the address bar instead, as it is automatically updated whenever you change anything.
      </p>

      <p>
        <input type="text" v-model="saveFilename" />
        <button @click="save()">Save</button>
      </p>

      <p>
        <input type="file" ref="loadFile" accept=".json" />
        <button @click="load()">Load</button>
      </p>
    </div>

    <h1>About / feedback</h1>
    <div class="about block">
      <p>
        Created by Mark van Renswoude. Open-source and available under the Unlicense to the public domain on <a href="https://github.com/MvRens/CuttingBoard" target="_blank">Github</a>, where feedback is welcome under Issues.
      </p>
      <p>
        Heavily inspired by <a href="http://www.lastalias.com/cbdesigner/">CBdesigner</a>.
      </p>
    </div>
  </div>

  <div class="app-preview">
    <h1>Edge grain</h1>
    <EdgeGrainPreview :scale="1" />

    <h1>End grain</h1>
    <EndGrainPreview :scale="1" />
  </div>
</template>

<script>
import Settings from './components/Settings.vue'
import Layers from './components/Layers.vue'
import Wood from './components/Wood.vue'
import EndGrainPreview from './components/EndGrainPreview.vue'
import EdgeGrainPreview from './components/EdgeGrainPreview.vue'

import { saveAs } from 'file-saver';
import { bytesToBase64, base64ToBytes } from './lib/base64';

export default {
  name: 'App',
  components: {
    EndGrainPreview,
    EdgeGrainPreview,
    Settings,
    Layers,
    Wood
  },

  data()
  {
    return {
      saveFilename: 'My cutting board'
    }
  },

  created()
  {
    const self = this;
    const checkHash = () =>
    {
      if (!location.hash)
        return;

      const hash = location.hash.substring(1);
      try
      {
        const decoded = base64ToBytes(hash);
        if (decoded)
          self.$store.commit('loadMsgPack', decoded);
      }
      catch (e)
      {
        console.error(e);
      }
    }

    checkHash();

    window.addEventListener('hashchange', () =>
    {
      checkHash();
    });
  },

  computed: {
    hash()
    {
      return bytesToBase64(this.$store.getters.saveMsgPack);
    }
  },

  methods: {
    save()
    {
      const state = this.$store.getters.save;
      const blob = new Blob([state], { type: 'text/plain; charset=utf-8' });

      saveAs(blob, this.saveFilename + '.json');
    },


    load()
    {
      const loadFile = this.$refs.loadFile.files[0];
      if (!loadFile)
        return;

      this.saveFilename = loadFile.name.toLowerCase().endsWith('.json')
        ? loadFile.name.substring(0, loadFile.name.length - 5)
        : loadFile.name;

      const reader = new FileReader();
      reader.addEventListener('load', (event) =>
      {
        this.$store.commit('load', event.target.result);
      });
      reader.readAsBinaryString(loadFile);
    }
  },

  watch: {
    hash: (newValue) =>
    {
      history.replaceState({}, '', '#' + newValue);
    }
  }
}
</script>

<style lang="scss">
#app {
  background-color: white;
  color: black;
  font-family: 'Verdana', 'Arial', sans-serif;
  font-size: 10pt;

  display: flex;
  flex-direction: horizontal;
}


h1
{
  background-color: #f0f0f0;
  border-bottom: solid 1px #c0c0c0;
  font-size: 100%;
  margin-top: 0;
  margin-bottom: .5em;
  padding: .25em;
}

.app-settings
{
  margin-right: 1em;

  .block
  {
    margin-bottom: 2em;
  }
}

.app-preview
{
  .preview
  {
    margin-bottom: 1em;
  }
}

.about
{
  width: 30em;
}
</style>

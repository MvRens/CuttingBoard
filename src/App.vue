<template>
  <div class="sidebar hideOnPrint">
    <div class="toolbar">
      <a :class="{ active: tab === 'settings' }" @click="tab = 'settings'"><font-awesome-icon icon="sliders-h" size="2x" fixed-width /> Settings</a>
      <a :class="{ active: tab === 'wood' }" @click="tab = 'wood'"><font-awesome-icon icon="tree" size="2x" fixed-width /> Wood</a>
      <a :class="{ active: tab === 'layers' }" @click="tab = 'layers'"><font-awesome-icon icon="layer-group" size="2x" fixed-width /> Layers</a>
      <a :class="{ active: tab === 'saveLoad' }" @click="tab = 'saveLoad'"><font-awesome-icon icon="save" size="2x" fixed-width /> Save / load</a>
      <a :class="{ active: tab === 'print' }" @click="tab = 'print'"><font-awesome-icon icon="print" size="2x" fixed-width /> Print</a>
      <a :class="{ active: tab === 'about' }" @click="tab = 'about'"><font-awesome-icon icon="info-circle" size="2x" fixed-width /> About</a>
    </div>

    <div class="tabs">
      <div class="tab" v-show="tab === 'settings'">
        <Settings />
      </div>

      <div class="tab" v-show="tab === 'layers'">
        <Layers />
      </div>

      <div class="tab" v-show="tab === 'wood'">
        <Wood />
      </div>

      <div class="tab" v-show="tab === 'print'">
        <p>
          Use your browser's built-in print functionality (for example, Ctrl+P on Windows) or click the button below to get a printable version of your board and cutting list.
        </p>

        <div>
          <input type="checkbox" v-model="printEdgeGrain" id="printEdgeGrain" />
          <label for="printEdgeGrain"> Edge grain preview</label>
        </div>
        <div>
          <input type="checkbox" v-model="printEndGrain" id="printEndGrain" />
          <label for="printEndGrain"> End grain preview</label>
        </div>
        <div>
          <input type="checkbox" v-model="printCuttingList" id="printCuttingList" />
          <label for="printCuttingList"> Cutting list and bill of materials</label>
        </div>

        <br />
        <button @click="print">Print</button>
      </div>

      <div class="tab" v-show="tab === 'saveLoad'">
        <p>
          Below you can download the current settings or load them again from a file. You can also bookmark the current page or copy the URL from the address bar instead, as it is automatically updated whenever you change anything.
        </p>

        <p>
          <input type="text" v-model="saveFilename" />
          <button @click="save">Save</button>
        </p>

        <p>
          <input type="file" ref="loadFile" accept=".json" />
          <button @click="load">Load</button>
        </p>
      </div>

      <div class="tab" v-show="tab === 'about'">
        <p>
          Created by Mark van Renswoude. Open-source and available under the Unlicense to the public domain on <a href="https://github.com/MvRens/CuttingBoard" target="_blank">Github</a>, where feedback is welcome under Issues.
        </p>
        <p>
          Heavily inspired by <a href="http://www.lastalias.com/cbdesigner/">CBdesigner</a>.
        </p>
      </div>
    </div>
  </div>

  <div class="content">
    <div :class="{ hideOnPrint: !printEdgeGrain }">
      <h1>Edge grain</h1>
      <EdgeGrainPreview :scale="1" />
    </div>

    <div :class="{ hideOnPrint: !printEndGrain }">
      <h1>End grain</h1>
      <EndGrainPreview :scale="1" />
    </div>

    <div :class="{ hideOnPrint: !printCuttingList }">
      <h1>Cutting list</h1>
      <CuttingList />
    </div>
  </div>
</template>

<script>
import Settings from './components/Settings.vue'
import Layers from './components/Layers.vue'
import Wood from './components/Wood.vue'
import EndGrainPreview from './components/EndGrainPreview.vue'
import EdgeGrainPreview from './components/EdgeGrainPreview.vue'
import CuttingList from './components/CuttingList.vue'

import { saveAs } from 'file-saver';
import { bytesToBase64, base64ToBytes } from './lib/base64';

export default {
  name: 'App',
  components: {
    EndGrainPreview,
    EdgeGrainPreview,
    Settings,
    Layers,
    Wood,
    CuttingList
  },

  data()
  {
    return {
      tab: 'settings',
      saveFilename: 'My cutting board',

      printEdgeGrain: true,
      printEndGrain: true,
      printCuttingList: true
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
    },


    print()
    {
      window.print();
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
html, body
{
  background-color: #444444;
  color: white;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: none;

  @media print
  {
    background-color: white;
    color: black;
    overflow: visible;
  }
}

#app
{
  font-family: 'Verdana', 'Arial', sans-serif;
  font-size: 10pt;

  display: flex;
  flex-direction: horizontal;

  width: 100%;
  height: 100%;
}

a
{
  color: #99ccff;
}

input, select
{
  background-color: #303030;
  color: white;
  border: solid 1px #606060;
  padding-top: .3em;
  padding-bottom: .3em;

  &:focus
  {
    outline: solid 1px #808080;
  }
}

input[type='number']
{
  text-align: right;
}

button
{
  background-color: #404040;
  color: white;
  border: solid 1px #606060;
  padding-top: .3em;
  padding-bottom: .3em;

  &:hover
  {
    background-color: #808080;
  }
}

.hideOnPrint
{
  @media print
  {
    display: none;
  }
}
</style>

<style lang="scss" scoped>
.sidebar
{
  background-color: #383838;
  color: white;
  width: 35em;
  flex-shrink: 0;
  box-shadow: 0 0 3em #101010;

  .toolbar
  {
    background-color: #333333;
    box-shadow: -.2em 0 .5em black;
    margin-bottom: .5em;

    a
    {
      color: white;
      display: inline-block;
      padding: .5em;
      padding-left: 1em;
      padding-right: 1em;
      cursor: pointer;

      &.active
      {
        background-color: #0066cc;
      }

      &:hover:not(.active)
      {
        background-color: #004d99;
      }

      > svg
      {
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
    }
  }

  .tab
  {
    padding: 1em;
  }
}

.settings
{
  margin-right: 1em;

  .block
  {
    margin-bottom: 2em;
  }
}

.content
{
  flex-grow: 1;
  padding: 2em;
  padding-left: 3em;
  overflow: auto;

  @media print
  {
    background-color: white;
    color: black;
    overflow: visible;
  }

  h1
  {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 150%;
  }

  .preview
  {
    margin-bottom: 2em;
  }
}

.loadSave, .about
{
  width: 30em;
}
</style>

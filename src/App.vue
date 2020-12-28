<template>
  <div class="app-settings">
    <h1>Settings</h1>
    <Settings class="block" />

    <h1>Layers</h1>
    <Layers class="block" />

    <h1>Wood types</h1>
    <Wood class="block" />

    <h1>About / feedback</h1>
    <div class="about">
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
    <EndGrainPreview :scale="1" />

    <h1>End grain</h1>
    <EdgeGrainPreview :scale="1" />
  </div>
</template>

<script>
import Settings from './components/Settings.vue'
import Layers from './components/Layers.vue'
import Wood from './components/Wood.vue'
import EndGrainPreview from './components/EndGrainPreview.vue'
import EdgeGrainPreview from './components/EdgeGrainPreview.vue'

export default {
  name: 'App',
  components: {
    EndGrainPreview,
    EdgeGrainPreview,
    Settings,
    Layers,
    Wood
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

.about, .todo
{
  width: 30em;
}
</style>

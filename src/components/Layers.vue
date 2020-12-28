<template>
  <div class="layers">
    <div class="add">
      <button @click="addLayer()">Add layer</button>
    </div>

    <span class="header">&nbsp;</span>
    <span class="header">Wood type</span>
    <span class="header">Width</span>
    <span class="header">&nbsp;</span>

    <template v-for="(layer, index) in layers">
      <div class="index">{{ index + 1 }}</div>
      <select v-model="layer.wood" class="wood">
        <option v-for="(item, index) in wood" :value="index">{{ item.name }}</option>
      </select>
      <input type="number" class="width" :value="layer.width" @input="layer.width = parseFloatDef($event.target.value)" />

      <div class="remove">
        <button @click="removeLayer(index)">X</button>
      </div>
    </template>
  </div>
</template>

<script>
import { units } from '../lib/units';

export default {
  computed: {
    settings() { return this.$store.state.settings; },
    wood() { return this.$store.state.wood; },
    layers() { return this.$store.state.boards[0].layers; },
  },


  methods: {
    parseFloatDef(value)
    {
      const parsedValue = parseFloat(value);
      return Object.is(parsedValue, NaN) ? 0 : parsedValue;
    },


    addLayer()
    {
      this.$store.commit('addLayer', 0);
    },


    removeLayer(index)
    {
      this.$store.commit('removeLayer', { board: 0, layer: index });
    }
  }
}
</script>

<style lang="scss" scoped>
.layers
{
  display: inline-grid;
  grid-template-columns: 3em 20em 5em 3em;
  grid-column-gap: 1em;

  .add
  {
    grid-column: 2 / 5;
    padding-bottom: 1em;
  }

  .header
  {
    font-weight: bold;
    margin-bottom: .25em;
  }
}
</style>
<template>
  <div class="preview">
    <div class="dimensions">Dimensions: {{ display(boardWidth) }} x {{ display(boardHeight) }} x {{ display(settings.boardThickness) }}</div>

    <svg
      :width="viewportWidth"
      :height="viewportHeight"
      :viewBox="viewBox">

      <rect
        v-for="(layer, index) in layers"
        :width="toPixels(settings.boardLength)"
        :height="toPixels(layer.width)"
        x="0"
        :y="getLayerOffset(index)"
        :style="getLayerStyle(index)" />
    </svg>
  </div>
</template>

<script>
import { units } from '../lib/units';

export default {
  props: {
    scale: Number
  },


  computed: {
    settings() { return this.$store.state.settings; },
    wood() { return this.$store.state.wood; },
    layers() { return this.$store.state.boards[0].layers; },

    boardWidth() { return this.settings.boardLength; },

    boardHeight()
    {
      if (this.layers.length == 0)
        return 0;

      return this.layers
          .map(currentValue => currentValue.width)
          .reduce((accumulator, currentValue) => accumulator + currentValue);
    },

    boardPixelWidth()
    {
      return this.toPixels(this.boardWidth);
    },

    boardPixelHeight()
    {
      return this.toPixels(this.boardHeight);
    },

    viewportWidth() { return Math.floor(this.boardPixelWidth * this.scale); },
    viewportHeight() { return Math.floor(this.boardPixelHeight * this.scale); },
    viewBox() { return '0 0 ' + this.boardPixelWidth + ' ' + this.boardPixelHeight; }
  },


  methods: {
    toPixels(value)
    {
      return units.toPixels(value, this.settings.units);
    },

    display(value)
    {
      return units.display(value, this.settings.units);
    },

    getLayerOffset(index)
    {
      if (index < 0 || index >= this.layers.length)
        return 0;

      let offset = 0;

      for (let i = 0; i < index; i++)
        offset += this.layers[i].width;

      return this.toPixels(offset);
    },

    getLayerStyle(index)
    {
      if (index < 0 || index >= this.layers.length)
        return 'fill: fuchsia';

      const woodIndex = this.layers[index].wood;
      if (woodIndex === null)
        return '';

      const borderStyle = this.settings.borders
        ? '; stroke-width: 1; stroke: black'
        : '';

      return 'fill: ' + this.wood[woodIndex].color + borderStyle;
    }
  }
}
</script>

<style lang="scss" scoped>
.dimensions
{
  margin-bottom: .5em;
}


svg
{
  @media screen
  {
    box-shadow: 0 0 3em black;
  }

  @media print
  {
    max-width: 100%;
  }
}
</style>
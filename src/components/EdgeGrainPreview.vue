<template>
  <div class="preview">
    <svg
      :width="viewportWidth"
      :height="viewportHeight"
      :viewBox="viewBox">
      <defs>
        <g id="strip">
          <rect
            v-for="(layer, index) in layers"
            :width="toPixels(settings.boardThickness)"
            :height="toPixels(layer.width)"
            x="0"
            :y="getLayerOffset(index)"
            :style="getLayerStyle(index)" />
        </g>
      </defs>

      <use
        v-for="(strip, index) in stripsPerBoard"
        xlink:href="#strip"
        :x="index * settings.boardThickness"
        y="0"
        :transform="getLayerTransform(index)" />
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

    stripsPerBoard()
    {
      const stripAndKerf = this.settings.crosscutWidth + this.settings.bladeKerf;
      if (stripAndKerf === 0)
        return 0;

      return Math.floor((this.settings.boardLength + this.settings.bladeKerf) / stripAndKerf);
    },

    boardWidth()
    {
      const boardWidth = this.stripsPerBoard * this.settings.boardThickness;
      return this.toPixels(boardWidth);
    },

    boardHeight()
    {
      return this.layers
          .map(currentValue => currentValue.width)
          .reduce((accumulator, currentValue) => accumulator + currentValue);
    },

    viewportWidth() { return Math.floor(this.boardWidth * this.scale); },
    viewportHeight() { return Math.floor(this.boardHeight * this.scale); },
    viewBox() { return '0 0 ' + this.boardWidth + ' ' + this.boardHeight; }
  },


  methods: {
    toPixels(value)
    {
      return units.toPixels(value, this.settings.units);
    },

    getLayerOffset(index)
    {
      if (index < 0 || index >= this.layers.length)
        return 0;

      let offset = 0;

      for (let i = 0; i < index; i++)
        offset += this.layers[i].width;

      return offset;
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
    },

    getLayerTransform(index)
    {
      if (!this.settings.alternateDirection || (index % 2) == 0)
        return '';

      return 'scale(1, -1) translate(0, -' + this.boardHeight + ')';
    }
  }
}
</script>
<template>
  <div class="layers">
    <div class="add">
      <button @click="addLayer()">Add layer</button>
    </div>

    <div class="hint">
      Tip: click and drag the layer number to move a layer
    </div>


    <span class="header">&nbsp;</span>
    <span class="header">Wood species</span>
    <span class="header">Width</span>
    <span class="header">&nbsp;</span>

    <template v-for="(layer, index) in layers">
      <div class="index" :class="{ dropTargetAbove: dropTarget === index, dropTargetBelow: dropTarget === layers.length && index === layers.length - 1 }" :ref="'layer' + index" @mousedown.prevent="startDrag(index)">{{ index + 1 }}</div>
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
  data()
  {
    return {
      dragIndex: null,
      dropTarget: null
    }
  },


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
    },


    startDrag(index)
    {
      this.dragIndex = index;
      this.dropTarget = index;

      const dragMouseMove = (event) =>
      {
        this.dropTarget = this.getTargetLayer(event.pageY);
      };

      let dragMouseUp;
      dragMouseUp = () =>
      {
        document.removeEventListener('mousemove', dragMouseMove);
        document.removeEventListener('mouseup', dragMouseUp);

        if (this.dragIndex !== this.dropTarget)
          this.$store.commit('moveLayer', { board: 0, from: this.dragIndex, to: this.dropTarget });

        this.dropTarget = null;
        this.dragIndex = null;
      };

      document.addEventListener('mousemove', dragMouseMove);
      document.addEventListener('mouseup', dragMouseUp);
    },


    getTargetLayer(yPos)
    {
      if (this.layers.length == 0)
        return null;

      const firstLayer = this.getPageOffsetRect(this.$refs.layer0);
      const lastLayer = this.getPageOffsetRect(this.$refs['layer' + (this.layers.length - 1)]);

      // On or above the first item
      if (yPos <= firstLayer.bottom)
        return 0;

      // Below the last item
      if (yPos >= lastLayer.bottom)
        return this.layers.length;

      // On the last item
      if (yPos >= lastLayer.top)
        return this.layers.length - 1;

      // Check the previous target first, as it is most likely unchanged due to how
      // often mouseMove events occur
      if (this.dropTarget  !== null && this.dropTarget > 0 && this.dropTarget < this.layers.length - 1)
      {
        const currentTarget = this.getPageOffsetRect(this.$refs['layer' + this.dropTarget]);
        if (yPos >= currentTarget.top && yPos < currentTarget.bottom)
          return this.dropTarget;
      }

      // Just loop through all the layers, there shouldn't be enough to warrant anything more efficient
      for (let i = 1; i < this.layers.length - 1; i++)
      {
        const testTarget = this.getPageOffsetRect(this.$refs['layer' + i]);
        if (yPos >= testTarget.top && yPos < testTarget.bottom)
          return i;
      }

      // This should never occur, so it probably will!
      return null;
    },


    getPageOffsetRect(element)
    {
      const clientRect = element.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      return {
        top: clientRect.top + scrollTop,
        left: clientRect.left + scrollLeft,
        right: clientRect.right + scrollLeft,
        bottom: clientRect.bottom + scrollTop
      };
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

  .hint
  {
    color: #808080;
    text-align: center;

    grid-column: 1 / 5;
    margin-bottom: 1em;
  }

  .index
  {
    cursor: pointer;

    &.dropTargetAbove
    {
      border-top: solid 1px white;
    }

    &.dropTargetBelow
    {
      border-bottom: solid 1px white;
    }
  }

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
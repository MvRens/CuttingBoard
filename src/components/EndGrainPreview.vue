<template>
  <div class="preview">
    <div class="dimensions">Dimensions: {{ display(boardWidth) }} x {{ display(boardHeight) }} x {{ display(settings.crosscutWidth) }}</div>

    <div v-if="boards.length > 1" class="draghint hideOnPrint">Click and drag strips to reorder them. Click once to reverse the direction.</div>

    <svg
      :width="viewportWidth"
      :height="viewportHeight"
      :viewBox="viewBox"
      :class="{ dragging: dropTarget !== null }">
      <defs>
        <g v-for="(board, boardIndex) in boards" :id="'strip' + boardIndex">
          <rect
            v-for="(layer, index) in board.layers"
            :width="toPixels(board.thickness)"
            :height="toPixels(layer.width)"
            x="0"
            :y="getBoardLayerOffset(board, index)"
            :style="getBoardLayerStyle(board, index)" />
        </g>
        <g id="dropTarget">
          <line x1="0" y1="0" x2="0" :y2="boardPixelHeight" style="stroke: white; stroke-width: 2" />
        </g>
      </defs>

      <use
        v-for="(layer, index) in endGrain"
        :ref="'strip' + index"
        :href="'#strip' + layer.board"
        :x="getLayerOffset(index)"
        y="0"
        :transform="getLayerTransform(index)"
        @mousedown.prevent="mouseDown(index, $event)" />

      <use
        v-if="dropTarget !== null"
        href="#dropTarget"
        :x="getLayerOffset(dropTarget)" />
    </svg>
  </div>
</template>

<script>
import { units } from '../lib/units';

export default {
  props: {
    scale: Number
  },


  data()
  {
    return {
      dragIndex: null,
      dropTarget: null
    };
  },


  computed: {
    settings() { return this.$store.state.settings; },
    boards() { return this.$store.state.boards; },
    wood() { return this.$store.state.wood; },
    endGrain() { return this.$store.state.endGrain },

    boardWidth()
    {
      const self = this;

      return this.endGrain
        .map(layer => layer.board >= 0 && layer.board < self.boards.length ? self.boards[layer.board].thickness : 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    },

    boardHeight()
    {
      // Calculate the total width of each board (adding all the layers, inner map/reduce),
      // then use the maximum value (outer map/reduce)
      return this.boards
        .map(board => board.layers
          .map(layer => layer.width)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0))
        .reduce((accumulator, currentValue) => currentValue > accumulator ? currentValue : accumulator, 0);
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

    getBoardLayerOffset(board, index)
    {
      if (index < 0 || index >= board.layers.length)
        return 0;

      let offset = 0;

      for (let i = 0; i < index; i++)
        offset += board.layers[i].width;

      return this.toPixels(offset);
    },

    getBoardLayerStyle(board, index)
    {
      if (index < 0 || index >= board.layers.length)
        return 'fill: fuchsia';

      const woodIndex = board.layers[index].wood;
      if (woodIndex < 0 || woodIndex >= this.wood.length)
        return '';

      const borderStyle = this.settings.borders
        ? '; stroke-width: 1; stroke: black'
        : '';

      return 'fill: ' + this.wood[woodIndex].color + borderStyle;
    },

    getLayerOffset(index)
    {
      if (index < 0 || index > this.endGrain.length)
        return 0;

      let offset = 0;

      for (let i = 0; i < index; i++)
      {
        const boardIndex = this.endGrain[i].board;
        if (boardIndex >= 0 && boardIndex < this.boards.length)
          offset += this.boards[boardIndex].thickness;
      }

      return this.toPixels(offset);
    },

    getLayerTransform(index)
    {
      let reversed = false;

      switch (this.settings.direction)
      {
        case 'alternate':
          reversed = (index % 2) == 0;
          break;

        case 'custom':
          reversed = index >= 0 && index < this.endGrain.length && this.endGrain[index].reversed;
          break;
      }

      return reversed ? 'scale(1, -1) translate(0, -' + this.boardPixelHeight + ')' : '';
    },

    reverseLayer(index)
    {
      if (this.settings.direction !== 'custom')
        return;

      if (index < 0 || index >= this.endGrain.length)
        return;

      this.endGrain[index].reversed = !this.endGrain[index].reversed;
    },


    mouseDown(index, event)
    {
      const self = this;
      const startX = event.pageX;
      let dragging = false;

      const dragMouseMove = (moveEvent) =>
      {
        if (!dragging)
        {
          if (Math.abs(moveEvent.pageX - startX) >= 5)
          {
            self.dragIndex = index;
            dragging = true;
          }
        }

        if (dragging)
          self.dropTarget = self.getTargetStrip(moveEvent.pageX);
      };

      let dragMouseUp;
      dragMouseUp = () =>
      {
        document.removeEventListener('mousemove', dragMouseMove);
        document.removeEventListener('mouseup', dragMouseUp);

        if (dragging)
        {
          if (self.dragIndex !== self.dropTarget)
            self.$store.commit('moveEndgrain', { from: self.dragIndex, to: self.dropTarget });

          self.dropTarget = null;
          self.dragIndex = null;
        }
        else
          self.reverseLayer(index);
      };

      document.addEventListener('mousemove', dragMouseMove);
      document.addEventListener('mouseup', dragMouseUp);
    },


    getTargetStrip(xPos)
    {
      if (this.endGrain.length == 0)
        return null;

      const firstStrip = this.getPageOffsetRect(this.$refs.strip0);
      const lastStrip = this.getPageOffsetRect(this.$refs['strip' + (this.endGrain.length - 1)]);

      // On or above the first item
      if (xPos <= firstStrip.right)
        return 0;

      // Below the last item
      if (xPos >= lastStrip.right)
        return this.endGrain.length;

      // On the last item
      if (xPos >= lastStrip.left)
        return this.endGrain.length - 1;

      // Check the previous target first, as it is most likely unchanged due to how
      // often mouseMove events occur
      if (this.dropTarget  !== null && this.dropTarget > 0 && this.dropTarget < this.endGrain.length - 1)
      {
        const currentTarget = this.getPageOffsetRect(this.$refs['strip' + this.dropTarget]);
        if (xPos >= currentTarget.left && xPos < currentTarget.right)
          return this.dropTarget;
      }

      // Just loop through all the strips, there shouldn't be enough to warrant anything more efficient
      for (let i = 1; i < this.endGrain.length - 1; i++)
      {
        const testTarget = this.getPageOffsetRect(this.$refs['strip' + i]);
        if (xPos >= testTarget.left && xPos < testTarget.right)
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
.dimensions
{
  margin-bottom: .5em;
}


.draghint
{
  margin-bottom: 2em;
}


svg
{
  user-select: none;

  @media screen
  {
    box-shadow: 0 0 3em black;
  }

  @media print
  {
    max-width: 100%;
  }

  &.dragging
  {
    cursor: grabbing;
  }
}
</style>
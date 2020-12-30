<template>
  <div class="board">
    <button @click="previousBoard" :disabled="boardIndex == 0">&lt;</button>
    <div class="name">Board {{ boardIndex + 1 }} of {{ boards.length }}</div>
    <button @click="removeBoard" v-if="boards.length > 1">Remove</button>
    <button @click="addBoard">Add</button>
    <button @click="nextBoard" :disabled="boardIndex == boards.length - 1">&gt;</button>
  </div>

  <template v-if="currentBoard !== null">
    <div class="boardsettings">
      <label for="boardLength">Board length</label>
      <input id="boardLength" type="number" :value="currentBoard.length" @change="$store.commit('updateBoard', { board: boardIndex, values: { length: parseFloatDef($event.target.value) }})" />

      <label for="boardThickness">Board thickness</label>
      <input id="boardThickness" type="number" :value="currentBoard.thickness" @change="$store.commit('updateBoard', { board: boardIndex, values: { thickness: parseFloatDef($event.target.value) }})" />
    </div>

    <div class="layers">
      <div class="hint">
        Tip: click and drag the layer number to move a layer
      </div>

      <span class="header">&nbsp;</span>
      <span class="header">Wood species</span>
      <span class="header">Width</span>
      <span class="header">&nbsp;</span>

      <template v-for="(layer, index) in currentBoard.layers">
        <div class="index" :class="{ dropTargetAbove: dropTarget === index, dropTargetBelow: dropTarget === currentBoard.layers.length && index === currentBoard.layers.length - 1 }" :ref="'layer' + index" @mousedown.prevent="startDrag(index)">{{ index + 1 }}</div>
        <select v-model="layer.wood" class="wood">
          <option v-for="(item, index) in wood" :value="index">{{ item.name }}</option>
        </select>
        <input type="number" class="width" :value="layer.width" @input="layer.width = parseFloatDef($event.target.value)" />

        <div class="remove">
          <button @click="removeLayer(index)">X</button>
        </div>
      </template>

      <div class="widthwarning" v-if="widthWarning !== null">
        {{ widthWarning }}
      </div>

      <div class="add">
        <button @click="addLayer()">Add layer</button>
      </div>
    </div>

    <div>
      <h2>Preview settings</h2>
      <input id="borders" type="checkbox" :checked="settings.borders" @change="$store.commit('updateSettings', { borders: $event.target.checked })" />
      <label for="borders"> Show borders</label>
    </div>

    <div>
      <h2>End grain layer direction</h2>
      <div>
        <input id="directionUniform" type="radio" :checked="settings.direction === 'uniform'" @change="setDirection($event, 'uniform')" />
        <label for="directionUniform"> Uniform</label>
      </div>

      <div>
        <input id="directionAlternate" type="radio" :checked="settings.direction === 'alternate'" @change="setDirection($event, 'alternate')" />
        <label for="directionAlternate"> Alternate</label>
      </div>

      <div>
        <input id="directionCustom" type="radio" :checked="settings.direction === 'custom'" @change="setDirection($event, 'custom')" />
        <label for="directionCustom"> Custom</label>
        <p v-if="settings.direction === 'custom'">
          Click the strips in the preview to reverse their direction. <span v-if="!settings.borders">This may be easier if you <a href="#" @click.prevent="$store.commit('updateSettings', { borders: true })">turn on</a> the 'Show borders' setting.</span>
        </p>
      </div>
    </div>
  </template>
</template>

<script>
import { units } from '../lib/units';

export default {
  data()
  {
    return {
      boardIndex: 0,
      dragIndex: null,
      dropTarget: null
    }
  },


  computed: {
    settings() { return this.$store.state.settings; },
    wood() { return this.$store.state.wood; },
    boards() { return this.$store.state.boards; },

    currentBoard()
    {
      return this.boardIndex >= 0 && this.boardIndex < this.boards.length
        ? this.boards[this.boardIndex]
        : null;
    },

    widthWarning()
    {
      const self = this;
      if (self.currentBoard === null || self.boards.length == 1)
        return null;

      let minWidth = null;
      let currentWidth = null;
      let maxWidth = null;

      self.boards.forEach((board, index) =>
      {
        const boardWidth = units.limitDecimals(
          board.layers
            .map(layer => layer.width)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          3);

        if (index == self.boardIndex)
          currentWidth = boardWidth;

        if (minWidth === null || boardWidth < minWidth)
          minWidth = boardWidth;

        if (maxWidth === null || boardWidth > maxWidth)
          maxWidth = boardWidth;
      });

      if (minWidth == maxWidth)
        return null;

      let message = "Your board are not of equal width. The current board is " + units.display(currentWidth, this.settings.units) + " ";

      if (currentWidth < maxWidth)
        message += "while the widest is " + units.display(maxWidth, this.settings.units) + ". ";
      else
        message += "while the smallest is " + units.display(minWidth, this.settings.units) + ". ";

      message += "The end grain board will not align.";
      return message;
    },

    maxBoardWidth()
    {
      // This is a copy from EndGrainPreview.vue, deduplicate maybe?
      return this.boards
        .map(board => board.layers
          .map(layer => layer.width)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0))
        .reduce((accumulator, currentValue) => currentValue > accumulator ? currentValue : accumulator, 0);
    }
  },


  methods: {
    parseFloatDef(value)
    {
      const parsedValue = parseFloat(value);
      return Object.is(parsedValue, NaN) ? 0 : parsedValue;
    },


    previousBoard()
    {
      if (this.boardIndex > 0)
        this.boardIndex--;
    },


    nextBoard()
    {
      if (this.boardIndex < this.boards.length - 1)
        this.boardIndex++;
    },


    addBoard()
    {
      this.$store.commit('addBoard', this.boardIndex);
      this.boardIndex = this.boards.length - 1;
    },


    removeBoard()
    {
      if (this.boards.length <= 1)
        return;

      this.$store.commit('removeBoard', this.boardIndex);

      if (this.boardIndex >= this.boards.length)
        this.boardIndex = this.boards.length - 1;
    },


    addLayer()
    {
      this.$store.commit('addLayer', this.boardIndex);
    },


    removeLayer(index)
    {
      this.$store.commit('removeLayer', { board: this.boardIndex, layer: index });
    },


    startDrag(index)
    {
      const self = this;
      self.dragIndex = index;
      self.dropTarget = index;

      const dragMouseMove = (event) =>
      {
        self.dropTarget = self.getTargetLayer(event.pageY);
      };

      let dragMouseUp;
      dragMouseUp = () =>
      {
        document.removeEventListener('mousemove', dragMouseMove);
        document.removeEventListener('mouseup', dragMouseUp);

        if (self.dragIndex !== self.dropTarget)
          self.$store.commit('moveLayer', { board: this.boardIndex, from: self.dragIndex, to: self.dropTarget });

        self.dropTarget = null;
        self.dragIndex = null;
      };

      document.addEventListener('mousemove', dragMouseMove);
      document.addEventListener('mouseup', dragMouseUp);
    },


    getTargetLayer(yPos)
    {
      if (this.currentBoard === null || this.currentBoard.layers.length == 0)
        return null;

      const firstLayer = this.getPageOffsetRect(this.$refs.layer0);
      const lastLayer = this.getPageOffsetRect(this.$refs['layer' + (this.currentBoard.layers.length - 1)]);

      // On or above the first item
      if (yPos <= firstLayer.bottom)
        return 0;

      // Below the last item
      if (yPos >= lastLayer.bottom)
        return this.currentBoard.layers.length;

      // On the last item
      if (yPos >= lastLayer.top)
        return this.currentBoard.layers.length - 1;

      // Check the previous target first, as it is most likely unchanged due to how
      // often mouseMove events occur
      if (this.dropTarget  !== null && this.dropTarget > 0 && this.dropTarget < this.currentBoard.layers.length - 1)
      {
        const currentTarget = this.getPageOffsetRect(this.$refs['layer' + this.dropTarget]);
        if (yPos >= currentTarget.top && yPos < currentTarget.bottom)
          return this.dropTarget;
      }

      // Just loop through all the layers, there shouldn't be enough to warrant anything more efficient
      for (let i = 1; i < this.currentBoard.layers.length - 1; i++)
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
    },


    setDirection(event, direction)
    {
      if (!event.target.checked)
        return;

      this.$store.commit('updateSettings', { direction: direction });
    }
  }
}
</script>

<style lang="scss" scoped>
.layers
{
  display: grid;
  grid-template-columns: min-content auto 5em min-content;
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
    cursor: grab;

    &.dropTargetAbove
    {
      border-top: solid 1px white;
      cursor: grabbing;
    }

    &.dropTargetBelow
    {
      border-bottom: solid 1px white;
      cursor: grabbing;
    }
  }

  .add
  {
    grid-column: 2 / 5;
    padding-top: 1em;
  }

  .widthwarning
  {
    font-size: 80%;
    color: yellow;
    grid-column: 2 / 5;
    padding-top: .5em;
  }

  .header
  {
    font-weight: bold;
    margin-bottom: .25em;
  }
}

.board
{
  display: flex;
  margin-bottom: 2em;

  .name
  {
    flex-grow: 1;
    padding: .5em;
  }
}


.boardsettings
{
  display: inline-grid;
  grid-template-columns: max-content 5em;
  grid-column-gap: 1em;

  margin-bottom: 2em;
}


h2
{
  margin-top: 2em;
}
</style>
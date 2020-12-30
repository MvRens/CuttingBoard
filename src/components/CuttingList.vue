<template>
  <table class="list">
    <tr>
      <th>Layer</th>
      <th>Wood species</th>
      <th class="dimension">Width</th>
    </tr>
    <template v-for="(board, boardIndex) in boards">
      <tr class="board" v-if="boards.length > 1">
        <td colspan="3">Board {{ boardIndex + 1 }}</td>
      </tr>

      <tr v-for="(layer, index) in board.layers">
        <td>{{ index + 1 }}</td>
        <td>{{ getLayerWood(board, index) }}</td>
        <td class="dimension">{{ getLayerWidth(board, index) }}</td>
      </tr>
    </template>
  </table>

  <h2>Bill of materials</h2>
  <table class="list">
    <tr>
      <th>Wood species</th>
      <th class="dimension">Length</th>
      <th class="dimension">Width</th>
      <th class="dimension">Thickness</th>
    </tr>
    <template v-for="(board, boardIndex) in bom">
      <tr class="board" v-if="bom.length > 1">
        <td colspan="3">Board {{ boardIndex + 1 }}</td>
      </tr>

      <tr v-for="stock in board">
        <td>{{ stock.woodName }}</td>
        <td class="dimension">{{ display(stock.length) }}</td>
        <td class="dimension">{{ display(stock.width) }}</td>
        <td class="dimension">{{ display(stock.thickness) }}</td>
      </tr>
    </template>
  </table>
</template>

<script>
import { units } from '../lib/units';

export default {
  computed: {
    settings() { return this.$store.state.settings; },
    boards() { return this.$store.state.boards; },
    wood() { return this.$store.state.wood; },

    bom()
    {
      const self = this;

      return self.boards.map((board, boardIndex) =>
      {
        const bom = [];
        const woodTally = {};

        board.layers.forEach(layer =>
        {
          if (woodTally.hasOwnProperty(layer.wood))
            woodTally[layer.wood] += layer.width + self.settings.bladeKerf;
          else
            woodTally[layer.wood] = layer.width;
        });

        for (let wood in woodTally)
        {
          if (!woodTally.hasOwnProperty(wood))
            continue;

          bom.push({
            board: boardIndex,
            woodName: wood >= 0 && wood < self.wood.length ? self.wood[wood].name : '',
            length: board.length,
            width: woodTally[wood],
            thickness: board.thickness
          });
        }

        return bom;
      });
    }
  },


  methods: {
    getLayerWood(board, index)
    {
      if (index < 0 || index >= board.layers.length)
        return '';

      const woodIndex = board.layers[index].wood;
      if (woodIndex < 0 || woodIndex >= this.wood.length)
        return '';

      return this.wood[woodIndex].name;
    },


    getLayerWidth(board, index)
    {
      if (index < 0 || index >= board.layers.length)
        return '';

      return this.display(board.layers[index].width);
    },


    display(value)
    {
      return units.display(value, this.settings.units);
    }
  }
}
</script>

<style lang="scss" scoped>
h2
{
  font-size: 110%;
}

.list
{
  border-collapse: collapse;
  margin-top: 1em;
  margin-bottom: 3em;

  th, td
  {
    padding: .25em;
    padding-left: 1em;
    padding-right: 1em;
  }

  .dimension
  {
    text-align: right;
  }

  tr.board td
  {
    font-style: italic;
  }

  tr:nth-child(even):not(.board) td
  {
    background-color: #555555;

    @media print
    {
      background-color: #f0f0f0;
    }
  }
}
</style>
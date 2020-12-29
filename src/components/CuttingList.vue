<template>
  <table class="list">
    <tr>
      <th>Layer</th>
      <th>Wood species</th>
      <th class="dimension">Width</th>
    </tr>
    <tr v-for="(layer, index) in layers">
      <td>{{ index + 1 }}</td>
      <td>{{ getLayerWood(index) }}</td>
      <td class="dimension">{{ getLayerWidth(index) }}</td>
    </tr>
  </table>

  <h2>Bill of materials</h2>
  <table class="list">
    <tr>
      <th>Wood species</th>
      <th class="dimension">Thickness</th>
      <th class="dimension">Length</th>
      <th class="dimension">Width</th>
    </tr>
    <tr v-for="stock in bom">
      <td>{{ stock.woodName }}</td>
      <td class="dimension">{{ display(settings.boardThickness) }}</td>
      <td class="dimension">{{ display(settings.boardLength) }}</td>
      <td class="dimension">{{ display(stock.width) }}</td>
    </tr>
  </table>
</template>

<script>
import { units } from '../lib/units';

export default {
  computed: {
    settings() { return this.$store.state.settings; },
    layers() { return this.$store.state.boards[0].layers; },
    wood() { return this.$store.state.wood; },

    bom()
    {
      const woodTally = {};

      this.layers.forEach(layer =>
      {
        if (woodTally.hasOwnProperty(layer.wood))
          woodTally[layer.wood] += layer.width + this.settings.bladeKerf;
        else
          woodTally[layer.wood] = layer.width;
      });

      const bom = [];

      for (let wood in woodTally)
      {
        if (!woodTally.hasOwnProperty(wood))
          continue;

        bom.push({
          woodName: wood !== null && wood >= 0 && wood < this.wood.length ? this.wood[wood].name : '',
          width: woodTally[wood]
        });
      }

      return bom;
    }
  },


  methods: {
    getLayerWood(index)
    {
      if (index < 0 || index >= this.layers.length)
        return '';

      const woodIndex = this.layers[index].wood;
      if (woodIndex === null || woodIndex < 0 || woodIndex >= this.wood.length)
        return '';

      return this.wood[woodIndex].name;
    },


    getLayerWidth(index)
    {
      if (index < 0 || index >= this.layers.length)
        return '';

      return this.display(this.layers[index].width);
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

  tr:nth-child(even) td
  {
    background-color: #555555;

    @media print
    {
      background-color: #f0f0f0;
    }
  }
}
</style>
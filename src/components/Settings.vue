<template>
  <div class="settings">
    <h2>Designer</h2>

    <label for="units">Units</label>
    <select id="units" :value="settings.units" @change="$store.commit('updateSettings', { units: $event.target.value })">
      <option value="mm">Millimeters</option>
      <option value="cm">Centimeters</option>
      <option value="inchdecimal">Inches (decimal)</option>
      <!--<option value="inchfractional">Inches (fractional)</option>-->
    </select>

    <h2>Tools</h2>
    <label for="bladeKerf">Blade kerf</label>
    <input id="bladeKerf" type="number" :value="settings.bladeKerf" @change="$store.commit('updateSettings', { bladeKerf: parseFloatDef($event.target.value) })" />

    <h2>End grain</h2>
    <label for="crosscutWidth">Crosscut width</label>
    <input id="crosscutWidth" type="number" :value="settings.crosscutWidth" @change="$store.commit('updateSettings', { crosscutWidth: parseFloatDef($event.target.value) })" />
  </div>
</template>

<script>
import { units } from '../lib/units';

export default {
  computed: {
    settings() { return this.$store.state.settings; }
  },


  methods: {
    parseFloatDef(value)
    {
      const parsedValue = parseFloat(value);
      return Object.is(parsedValue, NaN) ? 0 : parsedValue;
    }
  }
}
</script>

<style lang="scss" scoped>
.settings
{
  display: inline-grid;
  grid-template-columns: auto auto;
  grid-column-gap: 1em;
  grid-row-gap: .25em;

  h2
  {
    margin-top: 1em;
    margin-bottom: .25em;
    grid-column: 1 / 3;
  }
}
</style>
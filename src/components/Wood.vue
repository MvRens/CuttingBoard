<template>
  <div class="wood">
    <div class="add">
      <button @click="addWood()">Add wood type</button>
    </div>

    <span class="header">&nbsp;</span>
    <span class="header">Name</span>
    <span class="header">Colour</span>
    <span class="header">&nbsp;</span>

    <template v-for="(item, index) in wood">
      <span>&nbsp;</span>
      <input type="text" class="name" v-model="item.name" />
      <input type="color" class="color" v-model="item.color" />

      <div class="remove">
        <button @click="removeWood(index)">X</button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  computed: {
    settings() { return this.$store.state.settings; },
    wood() { return this.$store.state.wood; }
  },


  methods: {
    addWood()
    {
      this.$store.commit('addWood');
    },


    removeWood(index)
    {
      this.$store.commit('removeWood', index);
    }
  }
}
</script>

<style lang="scss" scoped>
.wood
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
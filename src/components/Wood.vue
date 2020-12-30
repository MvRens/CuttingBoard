<template>
  <div class="wood">
    <span class="header">Name</span>
    <span class="header">Colour</span>
    <span class="header">&nbsp;</span>

    <template v-for="(item, index) in wood">
      <input type="text" class="name" v-model="item.name" />
      <input type="color" class="color" v-model="item.color" />

      <div class="remove">
        <button @click="removeWood(index)">X</button>
      </div>
    </template>

    <div class="add">
      <button @click="addWood()">Add wood species</button>
    </div>
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
  display: grid;
  grid-template-columns: auto min-content min-content;
  grid-column-gap: 1em;

  .add
  {
    grid-column: 1 / 4;
    padding-top: 1em;
  }

  .header
  {
    font-weight: bold;
    margin-bottom: .25em;
  }

  button
  {
    height: 100%;
  }
}
</style>
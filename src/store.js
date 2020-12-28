import { createStore } from 'vuex';
import { units } from './lib/units';

export default createStore({
  state: {
    settings: {
      units: 'mm',
      borders: false,
      boardThickness: 20,
      boardLength: 700,
      bladeKerf: 3.5,
      crosscutWidth: 30,

      alternateDirection: true
    },

    wood: [
      { name: 'Walnut', color: '#58443f' },
      { name: 'Maple', color: '#f2e0aa' },
      { name: 'Cherry', color: '#bb8359' },
      { name: 'Mahogany', color: '#98473f' },
      { name: 'Yellowheart', color: '#ffff84' },
      { name: 'White oak', color: '#fdf4b9' },
      { name: 'Bubinga', color: '#7e3c34' },
      { name: 'Jatoba', color: '#9b281c' },
      { name: 'Padouk', color: '#933350' }
    ],

    boards: [
      {
        layers: [
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 },
          { wood: 0, width: 20 },
          { wood: 1, width: 20 }
        ]
      }
    ]
  },

  mutations: {
    addLayer(state, board)
    {
      if (board < 0 || board >= state.boards.length)
        return;

      state.boards[board].layers.push({
        wood: 0,
        width: units.fromMillimeters(20, state.settings.units)
      });
    },

    removeLayer(state, payload)
    {
      if (payload.board < 0 || payload.board >= state.boards.length)
        return;

      if (payload.layer < 0 || payload.layer >= state.boards[payload.board].length)
        return;

      state.boards[payload.board].layers.splice(payload.layer, 1);
    },


    addWood(state)
    {
      state.wood.push({
        name: 'Wood #' + (state.wood.length + 1),
        color: '#f2e0aa'
      });
    },

    removeWood(state, index)
    {
      if (index < 0 || index >= state.wood.length)
        return;

      // Update all layers
      state.boards.forEach(board =>
      {
        board.layers.forEach(layer =>
        {
          if (layer.wood === index)
            layer.wood = null
          else if (layer.wood > index)
            layer.wood--;
        });
      });

      state.wood.splice(index, 1);
    },


    updateSettings(state, payload)
    {
      for (const property in payload)
      {
        if (!payload.hasOwnProperty(property) || !state.settings.hasOwnProperty(property))
          continue;

        state.settings[property] = payload[property];
      }
    }
  },

  actions: {
  }
})

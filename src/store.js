import { createStore } from 'vuex';
import { units } from './lib/units';


function mergeObject(source, target)
{
  for (const property in source)
  {
    if (!source.hasOwnProperty(property) || !target.hasOwnProperty(property))
      continue;

    target[property] = source[property];
  }
}


function parseFloatDef(value)
{
  const parsedValue = parseFloat(value);
  return Object.is(parsedValue, NaN) ? 0 : parsedValue;
}



export default createStore({
  state: {
    settings: {
      units: 'cm',
      borders: false,
      boardThickness: 2,
      boardLength: 70,
      bladeKerf: 0.35,
      crosscutWidth: 3,

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
          { wood: 8, width: 1 },
          { wood: 1, width: 1.5 },
          { wood: 8, width: 2 },
          { wood: 1, width: 2 },
          { wood: 8, width: 15 },
          { wood: 1, width: 2 },
          { wood: 8, width: 1.5 },
          { wood: 1, width: 1 }
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

      const board = state.boards[payload.board];

      if (payload.layer < 0 || payload.layer >= board.layers.length)
        return;

      board.layers.splice(payload.layer, 1);
    },

    moveLayer(state, payload)
    {
      if (payload.board < 0 || payload.board >= state.boards.length)
        return;

      const board = state.boards[payload.board];

      if (payload.from < 0 || payload.from >= board.layers.length)
        return;

      if (payload.to < 0 || payload.to > board.layers.length)
        return;

      if (payload.to == board.layers.length)
      {
        // Move to end
        board.layers.push(board.layers[payload.from]);
        board.layers.splice(payload.from, 1);
      }
      else
      {
        const item = board.layers[payload.from];
        board.layers.splice(payload.from, 1);

        if (payload.to > payload.from)
          payload.to--;

        board.layers.splice(payload.to, 0, item);
      }
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
      const oldUnits = state.settings.units;

      mergeObject(payload, state.settings);

      if (oldUnits !== state.settings.units)
      {
        // Convert the settings
        state.settings.boardThickness = units.limitDecimals(units.convert(state.settings.boardThickness, oldUnits, state.settings.units), 3);
        state.settings.boardLength = units.limitDecimals(units.convert(state.settings.boardLength, oldUnits, state.settings.units), 3);
        state.settings.bladeKerf = units.limitDecimals(units.convert(state.settings.bladeKerf, oldUnits, state.settings.units), 3);
        state.settings.crosscutWidth = units.limitDecimals(units.convert(state.settings.crosscutWidth, oldUnits, state.settings.units), 3);

        // Convert the layers
        state.boards.forEach(board =>
        {
          board.layers.forEach(layer =>
          {
            layer.width = units.limitDecimals(units.convert(layer.width, oldUnits, state.settings.units), 3);
          });
        });
      }
    },


    load(state, payload)
    {
      const parsedPayload = JSON.parse(payload);

      if (parsedPayload.hasOwnProperty('settings'))
        mergeObject(parsedPayload.settings, state.settings);

      if (parsedPayload.hasOwnProperty('boards'))
      {

        const newBoards = parsedPayload.boards.map(board =>
        {
          if (!board.hasOwnProperty('layers'))
          {
            return {
              layers: []
            };
          }

          return {
            layers: board.layers.map(layer =>
            {
              return {
                wood: parseFloatDef(layer.wood),
                width: parseFloatDef(layer.width)
              }
            })
          };
        })

        if (newBoards.length === 0)
          newBoards.push({ layers: [] });

        state.boards = newBoards;
      }

      if (parsedPayload.hasOwnProperty('wood'))
      {
        const newWood = parsedPayload.wood.map(item =>
        {
          return {
            name: item.name,
            color: item.color
          };
        });

        state.wood = newWood;
      }

      // TODO validate layers and wood types and apply the new sets
    }
  },

  getters: {
    save(state)
    {
      return JSON.stringify(state);
    }
  }
})

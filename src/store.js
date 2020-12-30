import { createStore } from 'vuex';
import { units } from './lib/units';
import { UnitsEnum, DirectionEnum } from './lib/enums';

import { serialize, deserialize } from '@ygoe/msgpack';



function DefaultSettings()
{
  return {
    units: UnitsEnum.cm,
    borders: false,
    bladeKerf: 0.35,
    crosscutWidth: 3,
    direction: DirectionEnum.uniform
  };
}


function DefaultWood()
{
  return [
    { name: 'Walnut', color: '#58443f' },
    { name: 'Maple', color: '#f2e0aa' },
    { name: 'Cherry', color: '#bb8359' },
    { name: 'Mahogany', color: '#98473f' },
    { name: 'Yellowheart', color: '#ffff84' },
    { name: 'White oak', color: '#fdf4b9' },
    { name: 'Bubinga', color: '#7e3c34' },
    { name: 'Jatoba', color: '#9b281c' },
    { name: 'Padouk', color: '#933350' }
  ];
}


function DefaultBoards()
{
  return [
    {
      thickness: 2,
      length: 70,

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
  ];
}


function DefaultEndGrain()
{
  const settings = DefaultSettings();
  const boards = DefaultBoards();
  const result = [];

  updateEndGrain(result, settings, boards);

  return result;
}


export default createStore({
  state: {
    settings: DefaultSettings(),
    wood: DefaultWood(),
    boards: DefaultBoards(),
    endGrain: DefaultEndGrain()
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
      moveArrayItem(board.layers, payload.from, payload.to);
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
            layer.wood = -1
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
        state.settings.bladeKerf = units.limitDecimals(units.convert(state.settings.bladeKerf, oldUnits, state.settings.units), 3);
        state.settings.crosscutWidth = units.limitDecimals(units.convert(state.settings.crosscutWidth, oldUnits, state.settings.units), 3);

        // Convert the boards
        state.boards.forEach(board =>
        {
          board.thickness = units.limitDecimals(units.convert(board.thickness, oldUnits, state.settings.units), 3);
          board.length = units.limitDecimals(units.convert(board.length, oldUnits, state.settings.units), 3);

          board.layers.forEach(layer =>
          {
            layer.width = units.limitDecimals(units.convert(layer.width, oldUnits, state.settings.units), 3);
          });
        });
      }
    },


    addBoard(state, copyFrom)
    {
      if (copyFrom < 0 || copyFrom >= state.boards.length)
      {
        state.boards.push({
          thickness: 2,
          length: 70,
          layers: []
        });

        return;
      }

      const source = state.boards[copyFrom];

      state.boards.push({
        thickness: source.thickness,
        length: source.length,
        layers: source.layers.map(layer =>
        {
          return {
            wood: layer.wood,
            width: layer.width
          };
        })
      });

      updateEndGrain(state.endGrain, state.settings, state.boards);
    },


    removeBoard(state, index)
    {
      if (index < 0 || index >= state.boards.length)
        return;

      state.boards.splice(index, 1);

      // Update all references to the boards coming after
      state.endGrain.forEach(layer =>
      {
        if (layer.board == index)
          layer.board = -1;
        else if (layer.board > index)
          layer.board--;
      });

      updateEndGrain(state.endGrain, state.settings, state.boards);
    },


    updateBoard(state, payload)
    {
      if (payload.board < 0 || payload.board >= state.boards.length)
        return;

      const board = state.boards[payload.board];
      const oldLength = board.length;
      mergeObject(payload.values, board);

      if (oldLength !== board.length)
        updateEndGrain(state.endGrain, state.settings, state.boards);
    },


    moveEndgrain(state, payload)
    {
      moveArrayItem(state.endGrain, payload.from, payload.to);
    },


    // TODO some updates, like Wood properties and Layer width, don't go through the store yet. this works,
    // but is kinda defeating the rules of Vuex.


    load(state, payload)
    {
      const parsedPayload = JSON.parse(payload);
      loadObject(state, parsedPayload);
    },

    loadMsgPack(state, payload)
    {
      try
      {
        const parsedPayload = deserialize(payload);
        if (parsedPayload)
          loadObject(state, parsedPayload);
      }
      catch(e)
      {
        console.error(e);
      }
    }
  },

  getters: {
    save(state)
    {
      const serialized = serializeState(state, false);
      return JSON.stringify(serialized);
    },

    saveMsgPack(state)
    {
      const serialized = serializeState(state, true);
      return serialize(serialized);
    }
  }
});




function moveArrayItem(array, from, to)
{
  if (from < 0 || from >= array.length)
    return;

  if (to < 0 || to > array.length)
    return;

  if (to == array.length)
  {
    // Move to end
    array.push(array[from]);
    array.splice(from, 1);
  }
  else
  {
    const item = array[from];
    array.splice(from, 1);

    if (to > from)
      to--;

    array.splice(to, 0, item);
  }
}


function stripsPerBoard(settings, board)
{
  const stripAndKerf = settings.crosscutWidth + settings.bladeKerf;
  if (stripAndKerf === 0)
    return 0;

  let stripsPerBoard = (board.length + settings.bladeKerf) / stripAndKerf;

  // Try to account for rounding errors
  stripsPerBoard = units.limitDecimals(stripsPerBoard, 3);

  return Math.floor(stripsPerBoard);
}


function updateEndGrain(result, settings, boards)
{
  const boardTally = [];
  for (let i = 0; i < boards.length; i++)
    boardTally[i] = boards[i].length + settings.bladeKerf;

  const cutWidth = settings.crosscutWidth + settings.bladeKerf;
  const remove = [];

  // Check the current configuration and see if we still have enough
  result.forEach((layer, index) =>
  {
    let boardAvailable = false;

    if (layer.board >= 0 && layer.board < boards.length)
    {
      boardAvailable = boardTally[layer.board] >= cutWidth;
      if (boardAvailable)
        boardTally[layer.board] -= cutWidth;
    }

    if (!boardAvailable)
      remove.push(index);
  });

  for (let i = remove.length - 1; i >= 0; i--)
    result.splice(remove[i], 1);

  // If we have sufficient board length left, add the layers for it
  boardTally.forEach((remaining, index) =>
  {
    while (remaining >= cutWidth)
    {
      result.push({ board: index, reversed: false });
      remaining -= cutWidth;

      // Try to account for rounding errors
      remaining = units.limitDecimals(remaining, 3);
    }
  });
}



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
  return isNaN(parsedValue) ? 0 : parsedValue;
}


function parseIntDef(value)
{
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
}


function loadObject(state, parsedPayload)
{
  const deserialized = deserializeState(parsedPayload);

  mergeObject(deserialized.settings, state.settings);
  state.wood = deserialized.wood;
  state.boards = deserialized.boards;
  state.endGrain = deserialized.endGrain;

  updateEndGrain(state.endGrain, state.settings, state.boards);
}


// For the MessagePack version that is used in the URL, we minimize the
// property names as well to significantly reduce the size. Do not do
// this for the downloaded versions to make them more readable.
// Note that this map is also used to convert older MsgPack encoded payloads,
// as they used the same layout as the JSON data.
const SettingsNameMapJSON = {
  settings: {
    self: 'settings',
    units: 'units',
    borders: 'borders',
    bladeKerf: 'bladeKerf',
    crosscutWidth: 'crosscutWidth',
    direction: 'direction'
  },

  wood: {
    self: 'wood',
    name: 'name',
    color: 'color'
  },

  boards: {
    self: 'boards',
    thickness: 'thickness',
    length: 'length',
    layers: {
      self: 'layers',
      wood: 'wood',
      width: 'width'
    }
  },

  endGrain: {
    self: 'endGrain',
    board: 'board',
    reversed: 'reversed'
  }
};


const SettingsNameMapMsgPack = {
  settings: {
    self: 's',
    units: 'u',
    borders: 'b',
    bladeKerf: 'k',
    crosscutWidth: 'c',
    direction: 'd'
  },

  wood: {
    self: 'w',
    name: 'n',
    color: 'c'
  },

  boards: {
    self: 'b',
    thickness: 't',
    length: 'x',
    layers: {
      self: 'l',
      wood: 'w',
      width: 'x'
    }
  },

  endGrain: {
    self: 'e',
    board: 'b',
    reversed: 'r'
  }
};



// All external input and output is done through these functions to provide backwards
// compatibility and perform sanity checking. This means the rest of the application
// trust that the contents of the store is as expected.
function serializeState(state, messagePack)
{
  const map = messagePack ? SettingsNameMapMsgPack : SettingsNameMapJSON;
  const result = {};

  result[map.settings.self] = serializeSettings(state.settings, map);
  result[map.wood.self] = serializeWood(state.wood, map);
  result[map.boards.self] = serializeBoards(state.boards, map);
  result[map.endGrain.self] = serializeEndgrain(state.endGrain, map);

  return result;
}


function serializeSettings(settings, map)
{
  const result = {};

  result[map.settings.units] = settings.units;
  result[map.settings.borders] = settings.borders;
  result[map.settings.bladeKerf] = settings.bladeKerf;
  result[map.settings.crosscutWidth] = settings.crosscutWidth;
  result[map.settings.direction] = settings.direction;

  return result;
}


function serializeWood(wood, map)
{
  if (wood.length === 0)
    return [];

  return wood.map(item =>
  {
    const result = {};

    result[map.wood.name] = item.name;
    result[map.wood.color] = item.color;

    return result;
  });
}


function serializeBoards(boards, map)
{
  return boards.map(board =>
  {
    const boardResult = {};

    boardResult[map.boards.length] = board.length;
    boardResult[map.boards.thickness] = board.thickness;

    boardResult[map.boards.layers.self] = board.layers.map(layer =>
    {
      const layerResult = {};

      layerResult[map.boards.layers.wood] = layer.wood;
      layerResult[map.boards.layers.width] = layer.width;

      return layerResult;
    });

    return boardResult;
  });
}


function serializeEndgrain(endGrain, map)
{
  return endGrain.map(layer =>
  {
    const layerResult = {};

    layerResult[map.endGrain.board] = layer.board;
    layerResult[map.endGrain.reversed] = layer.reversed;

    return layerResult;
  });
}



function deserializeState(parsedPayload)
{
  const map = parsedPayload.hasOwnProperty(SettingsNameMapMsgPack.settings.self) ? SettingsNameMapMsgPack : SettingsNameMapJSON;

  const result = {
    settings: deserializeSettings(parsedPayload, map),
    wood: deserializeWood(parsedPayload, map),
    boards: deserializeBoards(parsedPayload, map),
    endGrain: deserializeEndgrain(parsedPayload, map)
  };


  // Backwards compatibility
  if (parsedPayload.hasOwnProperty('settings'))
  {
    if (parsedPayload.settings.hasOwnProperty('alternateDirection'))
      result.settings.direction = parsedPayload.settings.alternateDirection ? DirectionEnum.alternate : DirectionEnum.uniform;

    if (parsedPayload.settings.hasOwnProperty('boardLength'))
      result.boards[0].length = parseFloatDef(parsedPayload.settings.boardLength);

    if (parsedPayload.settings.hasOwnProperty('boardThickness'))
      result.boards[0].thickness = parseFloatDef(parsedPayload.settings.boardThickness);
  }

  if (result.endGrain.length === 0)
    updateEndGrain(result.endGrain, result.settings, result.boards);

  return result;
}


function deserializeSettings(parsedPayload, map)
{
  if (!parsedPayload.hasOwnProperty(map.settings.self))
    return DefaultSettings();

  const settings = parsedPayload[map.settings.self];

  return {
    units: UnitsEnum.isValid(settings[map.settings.units]) ? settings[map.settings.units] : UnitsEnum.cm,
    borders: settings[map.settings.borders] === true,
    bladeKerf: parseFloatDef(settings[map.settings.bladeKerf]),
    crosscutWidth: parseFloatDef(settings[map.settings.crosscutWidth]),
    direction: DirectionEnum.isValid(settings[map.settings.direction]) ? settings[map.settings.direction] : DirectionEnum.uniform,
  };
}


function deserializeWood(parsedPayload, map)
{
  if (!parsedPayload.hasOwnProperty(map.wood.self) || !Array.isArray(parsedPayload[map.wood.self]))
    return [];

  return parsedPayload[map.wood.self].map(item =>
  {
    return {
      name: item[map.wood.name],
      color: /^#[0-9A-F]{6}$/i.test(item[map.wood.color] || '') ? item[map.wood.color] : '#000000'
    };
  });
}


function deserializeBoards(parsedPayload, map)
{
  if (!parsedPayload.hasOwnProperty(map.boards.self) || !Array.isArray(parsedPayload[map.boards.self]))
    return [];

  const result = parsedPayload[map.boards.self].map(board =>
  {
    const boardResult = {
      thickness: parseFloatDef(board[map.boards.thickness]),
      length: parseFloatDef(board[map.boards.length]),
      layers: []
    };

    if (board.hasOwnProperty(map.boards.layers.self) && Array.isArray(board[map.boards.layers.self]))
    {
      boardResult.layers = board[map.boards.layers.self].map(layer =>
      {
        return {
          wood: parseIntDef(layer[map.boards.layers.wood]),
          width: parseFloatDef(layer[map.boards.layers.width])
        }
      });
    }

    return boardResult;
  });

  return result.length > 0
    ? result
    : { length: 0, thickness: 0, layers: [] };
}


function deserializeEndgrain(parsedPayload, map)
{
  if (!parsedPayload.hasOwnProperty(map.endGrain.self) || !Array.isArray(parsedPayload[map.endGrain.self]))
    return [];

  return parsedPayload[map.endGrain.self].map(layer =>
  {
    return {
      board: parseIntDef(layer[map.endGrain.board]),
      reversed: layer[map.endGrain.reversed] === true
    };
  });
}
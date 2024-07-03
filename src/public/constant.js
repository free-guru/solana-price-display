let tokenMetadata = {
  name: "PEPE",
  symbol: "PEPE",
  avatar:
    "https://dd.dexscreener.com/ds-data/tokens/solana/2Zaq3WyDJj2ZkMcuqUiTBfAXCjqZtqihxcwUdwv9dyHA.png",
  address: "2Zaq3WyDJj2ZkMcuqUiTBfAXCjqZtqihxcwUdwv9dyHA",
  pairAddress: "GdYgVJ6L5KEuiCkGcNXdaaoog4gFjeVPR2NJd3BFRYF5",
};

const pending = {
  metadata: {
    symbol: "",
    name: "",
    address: "",
    pairAddress: "",
    avatar: "./empty.png",
  },
};

const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

let resetFlag = false;
const eventList = {};

const initialize = () => {
  Object.values(eventList).forEach((series) => {
    series.setData([]);
  });
};

const preEventFunc = (event, series, callback) => {
  eventList[event] = series;
  if (event == "ratio" || event == "log") {
    if (eventList["ratio"] && eventList["log"]) {
      callback(eventList["ratio"], eventList["log"]);
    }
  } else {
    callback(series);
  }
};

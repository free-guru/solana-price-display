import fs from "fs";
import path from "path";
import tokenCache from "./tokens.json";

const fileLocation = path.join(__dirname, "./tokens.json");

const metadataDB = {};

const priceOC = {
  open: {
    timestamp: 0,
  },
  close: {
    timestamp: 0,
  },
};
const priceDB = {};

const ratioDB = {};

const logDB = {};

// export const saveToken = (data: any, token: any) => {
//   tokenCache[address] = token
//   fs.writeFileSync(fileLocation, JSON.stringify(tokenCache))
// }

// export const getToken = (address: string): any => {
// 	return tokenCache[address] || null
// }

export const getMetadata = (address: string) => {
  if (!metadataDB[address]) return { error: "fail" };

  return { error: null, metadata: metadataDB[address] };
};

export const saveMetadata = (address: string, metadata: any) => {
  console.log("save", metadata.marketCap);

  let signature = "";
  let oBase = metadata.base;
  let oQuote = metadata.quote;
  const cTR = (metadata.quote / metadata.base) * metadata.SOLPrice;
  let oTR = cTR;
  const cLR = metadata.marketCap / metadata.quote;

  const temp = {};

  if (metadataDB[address]) {
    signature = metadataDB[address].signature;
    oBase = metadataDB[address].oBase;
    oQuote = metadataDB[address].oQuote;
    oTR = metadataDB[address].oTR;

    temp["base"] = metadataDB[address].cBase;
    temp["quote"] = metadataDB[address].cQuote;
    temp["TR"] = metadataDB[address].cTR;
    temp["LR"] = metadataDB[address].cLR;
  }

  metadataDB[address] = {
    name: metadata.name,
    symbol: metadata.symbol,
    avatar: metadata.avatar,
    marketCap: metadata.marketCap,
    signature,
    cBase: metadata.base,
    cQuote: metadata.quote,
    cTR,
    cLR,
    oBase,
    oQuote,
    oTR,
  };

  return { metadata: metadataDB[address], temp };
};

export const saveSN = (
  address: string,
  signature: string,
  oBase: number,
  oQuote: number,
  oTR: number
) => {
  console.log("save sn", signature, oBase, oQuote, oTR);
  metadataDB[address].signature = signature;
  metadataDB[address].oBase = oBase;
  metadataDB[address].oQuote = oQuote;
  metadataDB[address].oTR = oTR;
};

export const getPrice = (
  address: string,
  time_from: number,
  time_to: number
) => {
  if (!priceDB[address]) return { error: "fail", time_from, time_to };

  if (priceOC.open.timestamp >= time_to)
    return {
      error: "not enough",
      time_from,
      time_to: priceOC.open.timestamp - 900,
    };
  else if (priceOC.close.timestamp <= time_from)
    return {
      error: "not enough",
      time_from: priceOC.close.timestamp + 900,
      time_to,
    };

  const tS = Math.min(priceOC.open.timestamp, time_from);
  const tE = Math.max(priceOC.close.timestamp, time_to);
  return {
    error: null,
    data: priceDB[address].filter((e) => e[0] >= tS && e[0] <= tE),
  };
};

export const savePrice = (address: string, prices: any) => {
  if (!Array.isArray(prices) || prices.length == 0) return;

  if (!priceDB[address]) {
    priceDB[address] = prices;
    return;
  }
  const len = prices.length;

  if (priceOC.open.timestamp >= prices[len - 1][0]) {
    priceDB[address].unshift(...prices);
    priceOC.open.timestamp = prices[0][0];
  } else {
    priceDB[address].push(...prices);
    priceOC.close.timestamp = prices[len - 1][0];
  }
};

export const getRatio = (
  address: string,
  time_from: number,
  time_to: number
) => {
  console.log("---requested range", time_from, time_to);
  if (!ratioDB[address]) return { error: "fail", isHistory: true };

  const ratioHistory = ratioDB[address].filter(
    (e) => e[0] >= time_from && e[0] < time_to
  );
  const logHistory = logDB[address].filter(
    (e) => e[0] >= time_from && e[0] < time_to
  );
  console.log("---ratioHistory, history", ratioHistory.length);

  if (ratioHistory.length == 0)
    return {
      error: "not enough",
      isHistory:
        ratioDB[address].length != 0 && ratioDB[address][0][0] < time_from
          ? false
          : true,
    };

  return { error: null, ratioHistory, logHistory };
};

export const saveRatio = (address: string, ratio: any, log: any) => {
  if (ratio.length == 0) return;

  if (!ratioDB[address] || ratioDB[address].length == 0) {
    ratioDB[address] = ratio;
    logDB[address] = log;
  } else {
    if (ratioDB[address][0][0] > ratio[ratio.length - 1][0]) {
      ratioDB[address].unshift(...ratio);
      logDB[address].unshift(...log);
    } else if (ratioDB[address][ratioDB[address].length - 1][0] < ratio[0][0]) {
      ratioDB[address].push(...ratio);
      logDB[address].push(...log);
    }
  }
  console.log(
    "---saved range",
    ratioDB[address][0][0],
    ratioDB[address][ratioDB[address].length - 1][0]
  );
};

import {
  getMetadata,
  getPrice,
  getRatio,
  saveMetadata,
  savePrice,
  saveRatio,
  saveSN,
} from "../cache/cache";
import { SOL_ADDRESS } from "../helpers";
import {
  ensureSeconds,
  getPriceHistoryFromBirdeye,
  tokenInfoFromDexscreener,
} from "../utils";
import { fetchAndParseSwapTransactions } from "../utils/transaction";

export const getPriceHistory = async (
  address: string,
  time_from: number,
  time_to: number
) => {
  try {
    const db = getPrice(address, time_from, time_to);
    if (db.error == null) return db.data;

    console.log("middleware", db);

    const fetchData = await getPriceHistoryFromBirdeye(
      address.toString(),
      db.time_from,
      db.time_to
    );

    savePrice(address, fetchData);

    console.log("middleware", fetchData.length);

    return fetchData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRatioHistory = async (
  address: string,
  time_from: number,
  time_to: number
) => {
  try {
    const ret = getRatio(address, time_from, time_to);
    if (ret.error == null) {
      return {
        ratioHistory: ret.ratioHistory,
        logHistory: ret.logHistory,
      };
    }

    let metadata: any = getMetadata(address);
    let temp = {};
    if (metadata.error == "fail" || !ret.isHistory) {
      metadata = await tokenInfoFromDexscreener(address, SOL_ADDRESS);
      const savedData = saveMetadata(address, metadata);
      metadata = savedData.metadata;
      temp = savedData.temp;
    } else {
      metadata = metadata.metadata;
    }

    const fromTime = ensureSeconds(time_from);
    const toTime = ensureSeconds(time_to);

    let open = {
      TS: fromTime,
      base: 0,
      quote: 0,
      tR: 0,
      lR: 0,
    };
    let close = {
      TS: toTime,
      SN: metadata.signature,
      base: metadata.oBase,
      quote: metadata.oQuote,
      tR: metadata.oTR,
    };

    if (!ret.isHistory) {
      open = {
        TS: fromTime,
        base: temp["base"],
        quote: temp["quote"],
        tR: temp["TR"],
        lR: temp["LR"],
      };
      close = {
        TS: toTime,
        SN: "",
        base: metadata.cBase,
        quote: metadata.cQuote,
        tR: metadata.cTR,
      };
    }

    const { ratioHistory, logHistory, signature, oBase, oQuote, oTR } =
      await fetchAndParseSwapTransactions(
        address,
        metadata.marketCap,
        open,
        close,
        ret.isHistory
      );

    if (ret.isHistory) saveSN(address, signature, oBase, oQuote, oTR);

    saveRatio(address, ratioHistory, logHistory);

    return { ratioHistory, logHistory };

    // if (!ret.isHistory) {
    //   ret.close.base = metaData.base;
    //   ret.close.quote = metaData.quote;
    // }

    // console.log("middleware", ret.open, ret.close);
    // const { ratioHistory, logHistory, signature, base, quote } =
    //   await fetchAndParseSwapTransactions(
    //     address,
    //     metaData.marketCap,
    //     ret.open,
    //     ret.close
    //   );

    // if (ret.isHistory) saveSN(address, signature, base, quote);

    // saveRatio(address, ratioHistory, logHistory);

    // return { ratioHistory, logHistory };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

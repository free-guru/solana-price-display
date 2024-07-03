import axios from "axios";
import util from "util";

import { BIRDEYE_API_KEY, SOL_ADDRESS, USDT_ADDRESS } from "../helpers";
import { setUncaughtExceptionCaptureCallback } from "process";
import { ensureSeconds } from ".";

export const tokenInfoFromDexscreener = async (base: string, quote: string) => {
  try {
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${base}`
    );

    if (res.data.pairs == null) return null;

    const pairs = res.data.pairs.filter((pair: any) => {
      return pair.dexId === "raydium" && pair.quoteToken.address === quote;
    });

    return pairs.length > 0
      ? {
          address: pairs[0].baseToken.address,
          symbol: pairs[0].baseToken.symbol,
          name: pairs[0].baseToken.name,
          avatar: pairs[0].info ? pairs[0].info.imageUrl : "",
          pairAddress: pairs[0].pairAddress,
          base: pairs[0].liquidity.base,
          quote: pairs[0].liquidity.quote,
          SOLPrice: pairs[0].priceUsd / pairs[0].priceNative,
          pairCreatedAt: pairs[0].pairCreatedAt,
          marketCap:
            pairs[0].fdv / (pairs[0].priceUsd / pairs[0].priceNative) / 2,
        }
      : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPriceFromBirdeye = async (
  tokenAddress: string,
  timeStart: number,
  timeEnd: number
) => {
  try {
    const tS = ensureSeconds(timeStart);
    const tE = ensureSeconds(timeEnd);
    console.log(tS, tE);

    const options = {
      method: "GET",
      headers: {
        "x-chain": "solana",
        "X-API-KEY": BIRDEYE_API_KEY,
      },
    };

    const res = await fetch(
      `https://public-api.birdeye.so/defi/history_price?address=${tokenAddress}&address_type=token&type=1m&time_from=${tS}&time_to=${tE}`,
      options
    );
    const parsed = await res.json();
    if (parsed.success) {
      return parsed.data.items.length > 0
        ? parsed.data.items.map((e) => {
            return [e.unixTime * 1000, e.value];
          })
        : [[0, 128]];
    } else {
      console.error(parsed.message);
      return [[0, 128]];
    }
  } catch (error) {
    return [[0, 128]];
  }
};

export const getPriceHistoryFromBirdeye = async (
  tokenAddress: string,
  timeStart: number,
  timeEnd: number
) => {
  try {
    const options = {
      method: "GET",
      headers: {
        "x-chain": "solana",
        "X-API-KEY": BIRDEYE_API_KEY,
      },
    };

    const tS = ensureSeconds(timeStart);
    const tE = ensureSeconds(timeEnd);

    const res = await fetch(
      `https://public-api.birdeye.so/defi/ohlcv?address=${tokenAddress}&type=5m&time_from=${tS}&time_to=${tE}`,
      options
    );
    const parsed = await res.json();

    if (parsed.success) {
      return parsed.data.items.map((e) => {
        return [e.unixTime * 1000, e.o, e.h, e.l, e.c];
      });
    } else {
      console.error(parsed.message);
      throw new Error(parsed.message);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

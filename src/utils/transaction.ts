import axios from "axios";

import { HELIUS_API_KEY, SOL_ADDRESS } from "../helpers";
import {
  getPriceFromBirdeye,
  getPriceHistoryFromBirdeye,
  tokenInfoFromDexscreener,
} from "./token";

const setOHLC = (target: Array<number>, compare: number) => {
  if (target[3] > compare) target[3] = compare;
  if (target[2] < compare) target[2] = compare;
  target[1] = compare;
  if (target[4] == 0) target[4] = compare;
};

export const fetchAndParseSwapTransactions = async (
  tokenAddress: string,
  marketCap: number,
  open: {
    TS: number;
    base: number;
    quote: number;
    tR: number;
    lR: number;
  },
  close: {
    TS: number;
    SN: string;
    base: number;
    quote: number;
    tR: number;
  },
  isHistory = true
) => {
  const ratioHistory = [];
  const logHistory = [];
  const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP&limit=100`;

  const SOLPrice = await getPriceFromBirdeye(SOL_ADDRESS, open.TS, close.TS);

  let beforeTimestamp = close.TS - 60;
  let tR = close.tR;
  let lR = marketCap / close.quote;

  let ratio = [beforeTimestamp * 1000, lR, lR, lR, lR];
  let log = [beforeTimestamp * 1000, tR, tR, tR, tR];

  try {
    while (true) {
      let u = url;
      if (close.SN) u += "&before=" + close.SN;

      console.log("signature", close.SN);
      const response = await axios.get(u);
      const transactions = response.data;

      if (transactions && transactions.length > 0) {
        for (let i = 0; i < transactions.length; i++) {
          let baseV = 0;
          let quoteV = 0;
          transactions[i].events.swap.innerSwaps
            .filter(
              (e) =>
                e.programInfo.source == "RAYDIUM" &&
                e.programInfo.instructionName == "SwapEvent"
            )
            .forEach((swapEvent) => {
              if (
                swapEvent.tokenInputs[0].mint == tokenAddress &&
                swapEvent.tokenOutputs[0].mint == SOL_ADDRESS
              ) {
                baseV -= swapEvent.tokenInputs[0].tokenAmount;
                quoteV += swapEvent.tokenOutputs[0].tokenAmount;
              } else if (
                swapEvent.tokenInputs[0].mint == SOL_ADDRESS &&
                swapEvent.tokenOutputs[0].mint == tokenAddress
              ) {
                quoteV -= swapEvent.tokenInputs[0].tokenAmount;
                baseV += swapEvent.tokenOutputs[0].tokenAmount;
              }
            });

          close.base += baseV;
          close.quote += quoteV;
          tR = (close.quote / close.base) * SOLPrice[0][1];
          lR = marketCap / close.quote;
          if (SOLPrice.length > 1) SOLPrice.shift();

          setOHLC(ratio, lR);
          setOHLC(log, tR);

          if (beforeTimestamp > transactions[i].timestamp) {
            ratioHistory.unshift(ratio);
            logHistory.unshift(log);

            if (beforeTimestamp <= open.TS) {
              if (!isHistory) {
                setOHLC(ratioHistory[0], open.lR);

                setOHLC(logHistory[0], open.tR);
              }
              return {
                ratioHistory,
                logHistory,
                signature: transactions[i].signature,
                oBase: close.base,
                oQuote: close.quote,
                oTR: tR,
              };
            }

            beforeTimestamp -= 60;
            ratio = [
              beforeTimestamp * 1000,
              ratio[1],
              ratio[1],
              ratio[1],
              ratio[1],
            ];
            log = [beforeTimestamp * 1000, log[1], log[1], log[1], log[1]];
          }
        }
        close.SN = transactions[transactions.length - 1].signature;
      } else {
        break;
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchAndParseALLSwapTransactions = async (
  tokenAddress: string
) => {
  try {
    const token = await tokenInfoFromDexscreener(tokenAddress, SOL_ADDRESS);
    if (!token) return null;

    const prices = await getPriceFromBirdeye(
      SOL_ADDRESS,
      Math.floor(token.pairCreatedAt / 1000 - 86400),
      Math.floor(new Date().getTime() / 1000 - 86400)
    );
    if (prices.length == 0) return null;

    let beforeTimestamp = 0;
    const history = [];
    const tP = [0, 0, 0, 100, 0];
    let nP = prices.pop();

    let base = token.base;
    let quote = token.quote;
    const marketCap = token.marketCap;
    console.log(marketCap, base, quote);
    let signature = "";
    const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP&limit=100`;
    while (true) {
      let u = url;
      if (signature != "") u += "&before=" + signature;

      const response = await axios.get(u);
      const transactions = response.data;
      console.log(transactions.length);

      if (!transactions || transactions.length == 0) return history;
      console.log(
        transactions[0].timestamp,
        transactions[transactions.length - 1].timestamp
      );
      for (let i = 0; i < transactions.length; i++) {
        if (beforeTimestamp == 0)
          beforeTimestamp = transactions[0].timestamp - 60;

        transactions[i].events.swap.innerSwaps
          .filter(
            (e) =>
              e.programInfo.source == "RAYDIUM" &&
              e.programInfo.instructionName == "SwapEvent"
          )
          .forEach((swapEvent) => {
            if (
              swapEvent.tokenInputs[0].mint == tokenAddress &&
              swapEvent.tokenOutputs[0].mint == SOL_ADDRESS
            ) {
              base -= swapEvent.tokenInputs[0].tokenAmount;
              quote += swapEvent.tokenOutputs[0].tokenAmount;
            } else if (
              swapEvent.tokenInputs[0].mint == SOL_ADDRESS &&
              swapEvent.tokenOutputs[0].mint == tokenAddress
            ) {
              quote -= swapEvent.tokenInputs[0].tokenAmount;
              base += swapEvent.tokenOutputs[0].tokenAmount;
            }
          });

        setOHLC(tP, (quote / base) * nP[1]);

        if (beforeTimestamp >= transactions[i].timestamp) {
          history.unshift([
            beforeTimestamp * 1000,
            tP[1],
            tP[2],
            tP[3],
            tP[4],
            marketCap / quote,
            (quote / base) * nP[1],
          ]);
          tP[4] = tP[1];
          tP[3] = tP[1];
          tP[2] = tP[1];
          beforeTimestamp -= 60;
          if (prices.length == 0) return history;
          nP = prices.pop();
        }
      }
      signature = transactions[transactions.length - 1].signature;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

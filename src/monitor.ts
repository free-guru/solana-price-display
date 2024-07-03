// import { getToken, saveToken, insertTokenData } from "./cache";
// import { SOL_ADDRESS, USDT_ADDRESS } from "./helpers";
// import { sleep, tokenInfoFromDexscreener } from "./utils";

// const saveDataToDB = async (arg: {
//   pair_address: string;
//   metadata: { address: string; name: string; symble: string; avatar: string };
//   data: [
//     {
//       timestamp: number;
//       token_price: number;
//       rate: number;
//       token_value: number;
//     },
//   ];
// }) => {
//   if (getToken(arg.metadata.address)) {
//     insertTokenData(arg.metadata.address, arg.data);
//   } else {
//     saveToken(arg.metadata.address, arg);
//   }
// };

// const monitor = (baseAddress: string, quoteAddress: string) => {
//   tokenInfoFromDexscreener(baseAddress, quoteAddress)
//     .then(async (token_SOL) => {
//       tokenInfoFromDexscreener(SOL_ADDRESS, USDT_ADDRESS)
//         .then(async (SOL_USDT) => {
//           console.log(`[${new Date()}]`);

//           const sol_price = token_SOL?.priceUsd / token_SOL?.priceNative;

//           // chart 1
//           console.log(`----- Token price: ${token_SOL?.priceUsd}`);

//           // chart 2
//           const rate =
//             (token_SOL?.priceUsd * token_SOL?.fdv) /
//             token_SOL?.priceNative /
//             100 /
//             token_SOL?.liquidity.base; //
//           // console.log(token_SOL?.liquidity.quote / token_SOL?.liquidity.base , token_SOL?.fdv / token_SOL?.priceNative / 100 / token_SOL?.liquidity.base)
//           console.log(`----- Ratio: ${rate}`);

//           // chart 3
//           const token_value =
//             ((token_SOL?.liquidity.quote / token_SOL?.liquidity.base) *
//               SOL_USDT.liquidity.quote) /
//             SOL_USDT.liquidity.base;
//           console.log(`----- Log: ${token_value}`);

//           // save to db
//           await saveDataToDB({
//             pair_address: token_SOL?.pairAddress,
//             metadata: token_SOL?.metadata,
//             data: [
//               {
//                 timestamp: new Date().getTime(),
//                 token_price: token_SOL?.priceUsd,
//                 rate,
//                 token_value,
//               },
//             ],
//           });

//           await sleep(40000);
//           monitor(baseAddress, quoteAddress);
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// };

// export const monitorTransactions = async () => {};

// export default monitor;

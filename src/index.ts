import express from "express";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import axios from "axios";
import fs from "fs";
import { Connection, PublicKey } from "@solana/web3.js";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";

import { HELIUS_API_KEY, PORT, SOL_ADDRESS, TOKEN_ADDRESS } from "./helpers";
import configRouter from "./routers/config.router";
import priceRouter from "./routers/price.router";
import ratioRouter from "./routers/ratio.router";
import {
  fetchAndParseALLSwapTransactions,
  fetchAndParseSwapTransactions,
} from "./utils/transaction";

const app = express();

app.use(cors());

app.use("/api/config", configRouter);
app.use("/api/price", priceRouter);
app.use("/api/ratio", ratioRouter);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}`);

//   const url = "http://localhost:" + PORT;

//   exec(`start ${url}`);
// });

fetchAndParseALLSwapTransactions("DaYYrQTtKqGCBiPtnXSUT5d8nDXBrtW5LoJHsg4opump")
  .then((ret) => console.log("return", ret))
  .catch((error) => console.log(error.message))
  .finally(() => process.exit(1));

// const test = async () => {
//   try {
//     const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
//     const connection = new Connection(url);
//     const pubKey = new PublicKey(
//       "6xpwhH3kEUM5VMYAPtooVpwEdLoza1yF6ZkyzsW15T13"
//     );

//     let latestSigns = [];
//     let flag = 0;
//     while (true) {
//       let signs = [];
//       if (latestSigns.length == 0)
//         signs = await connection.getSignaturesForAddress(pubKey);
//       else
//         signs = await connection.getSignaturesForAddress(pubKey, {
//           before: latestSigns[latestSigns.length - 1].address,
//           limit: 1000,
//         });
//       if (signs.length == 0) break;
//       console.log("signs", signs[0].signature, latestSigns.length);
//       latestSigns.push(...signs);
//     }
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// test();

// const test = async () => {
//   try {
//     console.log("starting...", new Date());

//     const { data: liquidityData } = await axios.get<{
//       official: any[];
//       unOfficial: any[];
//     }>("https://api.raydium.io/v2/sdk/liquidity/mainnet.json");

//     console.log("fetched liquidity data", new Date());
//     console.log(liquidityData);

//     const fileLocation = path.join(__dirname, "./test.json");

//     fs.writeFileSync(fileLocation, JSON.stringify(liquidityData));

//     console.log("done", new Date());
//   } catch (e) {
//     console.log(e);
//   } finally {
//     console.log("done");
//     process.exit(1);
//   }
// };

// test();

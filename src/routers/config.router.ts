import { Router } from "express";
import axios from "axios";
import {
  ensureSeconds,
  getPriceHistoryFromBirdeye,
  tokenInfoFromDexscreener,
} from "../utils";
import { getPrice, savePrice } from "../cache/cache";
import { getPriceHistory } from "../middleware";
import { SOL_ADDRESS } from "../helpers";

const configRouter = Router();

configRouter.get("/token", async (req, res) => {
  try {
    const address = req.query.address.toString();

    const metadata = await tokenInfoFromDexscreener(address, SOL_ADDRESS);

    if (metadata) {
      return res.json({ error: null, data: metadata });
    }

    return res.json({ error: "No metadata found", data: null });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

export default configRouter;

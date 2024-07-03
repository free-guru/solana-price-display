import { Router } from "express";
import axios from "axios";
import { ensureSeconds, getPriceHistoryFromBirdeye } from "../utils";
import { getPrice, savePrice } from "../cache/cache";
import { getPriceHistory } from "../middleware";

const priceRouter = Router();

priceRouter.get("/history", async (req, res) => {
  try {
    const {
      address,
      time_from = new Date().getTime() - 3600000,
      time_to = new Date().getTime(),
    } = req.query;

    const prices = await getPriceHistoryFromBirdeye(
      address.toString(),
      parseInt(time_from.toString()),
      parseInt(time_to.toString())
    );

    res.json(prices);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

export default priceRouter;

import { Router } from "express";
import axios from "axios";
import { ensureSeconds, getPriceHistoryFromBirdeye } from "../utils";
import { fetchAndParseSwapTransactions } from "../utils/transaction";
import { getRatioHistory } from "../middleware";

const ratioRouter = Router();

ratioRouter.get("/history", async (req, res) => {
  try {
    const {
      address,
      time_from = Math.floor(new Date().getTime()) - 6000000,
      time_to = Math.floor(new Date().getTime()),
    } = req.query;

    const { ratioHistory, logHistory } = await getRatioHistory(
      address.toString(),
      parseInt(time_from.toString()),
      parseInt(time_to.toString())
    );

    res.json({ ratioHistory, logHistory });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

export default ratioRouter;

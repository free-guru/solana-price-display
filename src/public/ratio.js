const ratioOptions = {
  title: {
    text: "Ratio Chart",
  },

  xAxis: {
    overscroll: 500000,
    range: 4 * 200000,
    gridLineWidth: 1,
  },

  rangeSelector: {
    buttons: [
      {
        type: "minute",
        count: 5,
        text: "5m",
      },
      {
        type: "hour",
        count: 1,
        text: "1h",
      },
      {
        type: "all",
        count: 1,
        text: "All",
      },
    ],
    selected: 1,
    inputEnabled: false,
  },

  navigator: {
    series: {
      color: "#000000",
    },
  },

  series: [
    {
      type: "candlestick",
      name: "Ratio",
      color: "#FF7F7F",
      upColor: "#90EE90",
      lastPrice: {
        enabled: true,
        label: {
          enabled: true,
          backgroundColor: "#FF7F7F",
        },
      },
    },
  ],
};

ratioOptions.chart = {
  events: {
    load() {
      const chart = this;
      const series = chart.series[0];
      preEventFunc("ratio", series, ratioReq);
    },
  },
};

ratioOptions.series[0].data = [
  // [1317888300000, 372, 372.3, 371.8, 372.24],
  // [1317888360000, 372.22, 372.45, 372.22, 372.3],
  // [1317888420000, 372.3, 373.25, 372.3, 373.15],
  // [1317888480000, 373.01, 373.5, 373, 373.24],
  // [1317888540000, 373.36, 373.88, 373.19, 373.88],
  // [1317888600000, 373.8, 374.34, 373.75, 374.29],
  // [1317888660000, 374.29, 374.43, 374, 374.01],
  // [1317888720000, 374.05, 374.35, 373.76, 374.35],
  // [1317888780000, 374.41, 375.24, 374.37, 374.9],
  // [1317888840000, 374.83, 375.73, 374.81, 374.96],
  // [1317888900000, 374.81, 375.4, 374.81, 375.25],
  // [1317888960000, 375.2, 375.7, 375.14, 375.19],
  // [1317889020000, 375.43, 375.43, 374.75, 374.76],
];

const logOptions = {
  title: {
    text: "Log Chart",
  },

  xAxis: {
    overscroll: 500000,
    range: 4 * 200000,
    gridLineWidth: 1,
  },

  rangeSelector: {
    buttons: [
      {
        type: "minute",
        count: 5,
        text: "5m",
      },
      {
        type: "hour",
        count: 1,
        text: "1h",
      },
      {
        type: "all",
        count: 1,
        text: "All",
      },
    ],
    selected: 1,
    inputEnabled: false,
  },

  navigator: {
    series: {
      color: "#000000",
    },
  },

  series: [
    {
      type: "candlestick",
      name: "Log",
      color: "#FF7F7F",
      upColor: "#90EE90",
      lastPrice: {
        enabled: true,
        label: {
          enabled: true,
          backgroundColor: "#FF7F7F",
        },
      },
    },
  ],
};

logOptions.chart = {
  events: {
    load() {
      const chart = this;
      const series = chart.series[0];
      preEventFunc("log", series, ratioReq);
    },
  },
};

logOptions.series[0].data = [
  // [1317888300000, 372, 372.3, 371.8, 372.24],
  // [1317888360000, 372.22, 372.45, 372.22, 372.3],
  // [1317888420000, 372.3, 373.25, 372.3, 373.15],
  // [1317888480000, 373.01, 373.5, 373, 373.24],
  // [1317888540000, 373.36, 373.88, 373.19, 373.88],
  // [1317888600000, 373.8, 374.34, 373.75, 374.29],
  // [1317888660000, 374.29, 374.43, 374, 374.01],
  // [1317888720000, 374.05, 374.35, 373.76, 374.35],
  // [1317888780000, 374.41, 375.24, 374.37, 374.9],
  // [1317888840000, 374.83, 375.73, 374.81, 374.96],
  // [1317888900000, 374.81, 375.4, 374.81, 375.25],
  // [1317888960000, 375.2, 375.7, 375.14, 375.19],
  // [1317889020000, 375.43, 375.43, 374.75, 374.76],
];

let rOpenTime = Math.floor(new Date().getTime());
let rCloseTime = rOpenTime + 60000;
let rFlag = false;
let rResetFlag = false;

const ratioReq = async (rSeries, lSeries) => {
  if (rResetFlag) {
    rOpenTime = Math.floor(new Date().getTime());
    rCloseTime = rOpenTime + 60000;
    rFlag = false;
    rResetFlag = false;
  }

  if (!rFlag) {
    try {
      const before = rOpenTime - 300000;
      const data = await fetch(
        `http://localhost:2001/api/ratio/history?address=${tokenMetadata.address}&time_from=${before}&time_to=${rOpenTime}`
      );
      const parsedData = await data.json();

      const { ratioHistory, logHistory } = parsedData;

      if (ratioHistory.lentgth < 1) return;

      const newRData = ratioHistory.concat(rSeries.options.data);
      rSeries.setData(newRData);

      const newLData = logHistory.concat(lSeries.options.data);
      lSeries.setData(newLData);

      rOpenTime = ratioHistory[0][0] - 30000;
    } catch (error) {
      // console.log(error.message);
    } finally {
      if (rResetFlag) {
        rSeries.setData([]);
        lSeries.setData([]);
      }

      await sleep(1000);
      rFlag = true;
      // console.log("ratioReq1");
      ratioReq(rSeries, lSeries);
    }
  } else {
    try {
      const now = Math.floor(new Date().getTime());
      console.log("ratio", rCloseTime, now, now - rCloseTime);
      if (now - rCloseTime > 60000) {
        const data = await fetch(
          `http://localhost:2001/api/ratio/history?address=${tokenMetadata.address}&time_from=${rCloseTime}&time_to=${now}`
        );
        const parsedData = await data.json();

        const { ratioHistory, logHistory } = parsedData;

        if (ratioHistory.length < 1) return;

        const newRData = rSeries.options.data.concat(ratioHistory);
        rSeries.setData(newRData);

        const newLData = lSeries.options.data.concat(logHistory);
        lSeries.setData(newLData);

        console.log(
          "ratioReq2",
          ratioHistory[0][0],
          ratioHistory[ratioHistory.length - 1][0]
        );

        rCloseTime = ratioHistory[ratioHistory.length - 1][0] + 60000;
        // console.log("ratioReq2", rCloseTime);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      if (rResetFlag) {
        rSeries.setData([]);
        lSeries.setData([]);
      }

      await sleep(1000);
      rFlag = false;
      // console.log("ratioReq2");
      ratioReq(rSeries, lSeries);
    }
  }
};

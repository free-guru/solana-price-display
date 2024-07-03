const priceOptions = {
  title: {
    text: "Price Token Chart",
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

priceOptions.series[0].data = [
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

priceOptions.chart = {
  events: {
    load() {
      const chart = this;
      const series = chart.series[0];

      preEventFunc("price", series, priceReq);
    },
  },
};

let open_time = new Date().getTime();
let close_time = open_time - 360000;
let flag = false;
let pResetFlag = false;

const priceReq = (series) => {
  if (pResetFlag) {
    open_time = new Date().getTime();
    close_time = open_time - 360000;
    flag = false;
    pResetFlag = false;
  }

  if (flag) {
    const now = new Date().getTime();
    fetch(
      `http://localhost:2001/api/price/history?address=${tokenMetadata.address}&time_from=${close_time}&time_to=${now}`
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.length < 1) return;
        close_time = response[response.length - 1][0] + 1000;

        const newData = series.options.data.concat(response);
        series.setData(newData);
      })
      .catch((error) => {
        console.log(error);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(async () => {
        if (pResetFlag) {
          series.setData([]);
        }

        await sleep(1000);
        flag = false;
        priceReq(series);
      });
  } else {
    const time_start = open_time - 36000000;
    fetch(
      `http://localhost:2001/api/price/history?address=${tokenMetadata.address}&time_from=${time_start}&time_to=${open_time}`
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.length < 1) return;

        open_time = response[0][0] - 1000;

        const newData = response.concat(series.options.data);
        series.setData(newData);
      })
      .catch((error) => {
        console.log(error);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(async () => {
        if (pResetFlag) {
          series.setData([]);
        }

        flag = true;
        await sleep(3000);
        priceReq(series);
      });
  }
};

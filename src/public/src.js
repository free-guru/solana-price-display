// price
Highcharts.stockChart("price-chart", priceOptions);

// ratio
Highcharts.stockChart("ratio-chart", ratioOptions);

// log
Highcharts.stockChart("log-chart", logOptions);

let id = 0;

const hidePreShow = () => {
  $("#preshow-container").hide();
};

const showPreShow = () => {
  $("#avatar").attr("src", pending.metadata.avatar);
  console.log(pending.metadata);
  $("#symbol").html(pending.metadata.symbol);
  $("#preshow-container").show();
};

const updateMetadata = () => {
  $("#meta-avatar").attr("src", tokenMetadata.avatar);
  $("#meta-symbol").html(tokenMetadata.symbol);
};

const hideError = () => {
  $("#error").hide();
  $("#search-input").attr("border", "1px solid #fff");
};

const showError = (desc) => {
  $("#error").text(desc);
  $("#error").show();
  $("#search-input").attr("border", "1px solid #f00");
};

$(document).ready(function () {
  $("#search-input").on("input", function () {
    dInput = this.value;
    console.log(dInput);
    if (id != 0) {
      clearTimeout(id);
    }
    id = setTimeout(function () {
      const tokenAddress = $("#search-input").val();
      if (tokenAddress == "") return;

      hideError();
      hidePreShow();

      fetch(`http://localhost:2001/api/config/token?address=${tokenAddress}`)
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          if (response.error == null) {
            pending.metadata = response.data;
            pending.metadata.avatar = response.data.avatar || "./empty.png";
            showPreShow();
          } else {
            showError("Invalid Token Address");
          }
        })
        .catch((error) => {
          console.log(error);
          showError("Internal Server Error");
        })
        .finally(() => {
          id = 0;
        });
    }, 500);
  });

  $("#show-btn").on("click", function () {
    hidePreShow();

    if (tokenMetadata.address == pending.metadata.address) {
      $("#search-input").val("");
      return;
    }

    tokenMetadata = pending.metadata;

    pResetFlag = true;
    rResetFlag = true;
    initialize();

    $("#search-input").val("");

    updateMetadata();
  });

  hidePreShow();
  hideError();
  updateMetadata();
});

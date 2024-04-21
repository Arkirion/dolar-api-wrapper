const express = require("express");
const app = express();
const axios = require('axios');
const BigNumber = require("bignumber.js");
const cors = require("cors");

app.use(cors({
  origin:"*"
}))

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/dolarhoy", async (req, res) => {
  try {
    const urls = [
      "https://dolarhoy.com/i/cotizaciones/dolar-bancos-y-casas-de-cambio",
      "https://dolarhoy.com/i/cotizaciones/dolar-blue",
    ];

    const requests = urls.map((url) => {
      return axios.get(url);
    });
    
    const rawData = await axios.all(requests);

    let bidBlue, askBlue, bidOfi, askOfi;
    for (const data of rawData) {
      const stringHTML = data.data.slice(54000);
      if (stringHTML.indexOf("blue") > 0) {
        [bidBlue, askBlue] = [...stringHTML.match(/(\d+\.\d{1,2})/g)];
      }
      if (stringHTML.indexOf("oficial") > 0) {
        [bidOfi, askOfi] = [...stringHTML.match(/(\d+\.\d{1,2})/g)];
      }
    }

    const response = [
      {
        label: "oficial",
        ask: new BigNumber(askOfi).toFixed(),
        bid: new BigNumber(bidOfi).toFixed(),
      },
      {
        label: "blue",
        ask: new BigNumber(askBlue).toFixed(),
        bid: new BigNumber(bidBlue).toFixed(),
      },
    ];

    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success: false,
      error: error,
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});
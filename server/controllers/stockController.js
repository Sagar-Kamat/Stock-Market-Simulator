const User = require("../models/userModel");
const Stock = require("../models/stockModel");
const Recommendation = require("../models/recommendModel");
const data = require("../config/stocksData");
const Axios = require("axios");
const {spawn} = require('child_process');

exports.purchaseStock = async (req, res) => {
  try {
    const { userId, ticker, quantity, price } = req.body;

    if (req.user !== userId) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const totalPrice = quantity * price;
    if (user.balance - totalPrice < 0) {
      return res.status(200).json({
        status: "fail",
        message: `You don't have enough cash to purchase this stock.`,
      });
    }

    switch(ticker) {
      case "AAPL":
        rec1 = "Microsoft";
        rec2 = "Intel";
        rec3 = "IBM";
        break;

      case "AMZN":
        rec1 = "Microsoft";
        rec2 = "Apple";
        rec3 = "Intel";
        break;

      case "GOOG":
        rec1 = "Microsoft";
        rec2 = "IBM";
        rec3 = "Intel";
        break;

      case "MSFT":
        rec1 = "Intel";
        rec2 = "IBM";
        rec3 = "Chevron";
        break;

      case "WMT":
        rec1 = "Coca-Cola";
        rec2 = "McDonald`s";
        rec3 = "Nike";
        break;

      case "INTC":
        rec1 = "Microsoft";
        rec2 = "IBM";
        rec3 = "Chevron";
        break;
        
      case "AXP":
        rec1 = "Walmart";
        rec2 = "Chevron";
        rec3 = "Microsoft";
        break;

      case "BA":
        rec1 = "Walmart";
        rec2 = "American Express";
        rec3 = "Chevron";
        break;
        
      case "CSCO":
        rec1 = "Microsoft";
        rec2 = "Intel";
        rec3 = "IBM";
        break;

      case "GS":
        rec1 = "Intel";
        rec2 = "Chevron";
        rec3 = "IBM";
        break;

      case "JNJ":
        rec1 = "Intel";
        rec2 = "Chevron";
        rec3 = "Goldman Sachs";
        break;

      case "KO":
        rec1 = "McDonald`s";
        rec2 = "Walmart";
        rec3 = "Procter & Gamble";
        break;

      case "MCD":
        rec1 = "Walmart";
        rec2 = "Coca-Cola";
        rec3 = "Procter & Gamble";
        break;

      case "NKE":
        rec1 = "Walmart";
        rec2 = "Procter & Gamble";
        rec3 = "Chevron";
        break;

      case "PG":
        rec1 = "Walmart";
        rec2 = "McDonald`s";
        rec3 = "Coca-Cola";
        break;
      case "VZ":
        rec1 = "Chevron";
        rec2 = "American Express";
        rec3 = "VISA";
        break;

      case "CRM":
        rec1 = "Cisco Systems";
        rec2 = "IBM";
        rec3 = "American Express";
        break;

      case "V":
        rec1 = "American Express";
        rec2 = "Chevron";
        rec3 = "Salesforce";
        break;

      case "UNH":
        rec1 = "Procter & Gamble";
        rec2 = "Coca-Cola";
        rec3 = "McDonald`s";
        break;

      case "IBM":
        rec1 = "Microsoft";
        rec2 = "Intel";
        rec3 = "Chevron";
        break;

      case "CVX":
        rec1 = "Procter & Gamble";
        rec2 = "American Express";
        rec3 = "Intel";
        break;

      default:
        
    }

    const purchase = new Stock({ userId, ticker, quantity, price, rec1, rec2, rec3 });
    await purchase.save();
    const updatedUser = await User.findByIdAndUpdate(userId, {
      balance:
        Math.round((user.balance - totalPrice + Number.EPSILON) * 100) / 100,
    });

    return res.status(200).json({
      status: "success",
      stockId: purchase._id,
      user: {
        username: updatedUser.username,
        id: updatedUser._id,
        balance:
          Math.round((user.balance - totalPrice + Number.EPSILON) * 100) / 100,
      },
    });
  } catch (error) {
    return res.status(200).json({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.sellStock = async (req, res) => {
  try {
    const { userId, stockId, quantity, price } = req.body;

    if (req.user !== userId) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    if (quantity > stock.quantity) {
      return res.status(200).json({
        status: "fail",
        message: "Invalid quantity.",
      });
    }

    if (quantity === stock.quantity) {
      await Stock.findByIdAndDelete(stockId);
    } else {
      await Stock.findByIdAndUpdate(stockId, {
        quantity: stock.quantity - quantity,
      });
    }

    const saleProfit = quantity * price;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      balance:
        Math.round((user.balance + saleProfit) * 100) / 100,
    });

    return res.status(200).json({
      status: "success",
      user: {
        username: updatedUser.username,
        id: updatedUser._id,
        balance:
          Math.round((user.balance + saleProfit) * 100) / 100,
      },
    });
  } catch (error) {
    return res.status(200).json({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

const getPricesData = async (stocks) => {
  try {
    const promises = stocks.map(async (stock) => {
      const url = `https://api.tiingo.com/tiingo/daily/${stock.ticker}/prices?token=520c8c82d2c1f3914f14a7b66668541cb4025836`;
      const response = await Axios.get(url);
      return {
        ticker: stock.ticker,
        date: response.data[0].date,
        adjClose: response.data[0].adjClose,
      };
    });

    return Promise.all(promises);
  } catch (error) {
    return [];
  }
};

exports.getStockForUser = async (req, res) => {
  try {
    if (req.user !== req.params.userId) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const stocks = await Stock.find({ userId: req.params.userId });
    const stocksData = await getPricesData(stocks);
    const modifiedStocks = stocks.map((stock) => {
      let name;
      let currentPrice;
      let currentDate;
      data.stockData.forEach((stockData) => {
        if (stockData.ticker.toLowerCase() === stock.ticker.toLowerCase()) {
          name = stockData.name;
        }
      });

      stocksData.forEach((stockData) => {
        if (stockData.ticker.toLowerCase() === stock.ticker.toLowerCase()) {
          currentDate = stockData.date;
          currentPrice = stockData.adjClose;
        }
      });
      console.log(stock);
      return {
        id: stock._id,
        ticker: stock.ticker,
        name,
        purchasePrice: stock.price,
        purchaseDate: stock.date,
        quantity: stock.quantity,
        currentDate,
        currentPrice,
        rec1: stock.rec1, 
        rec2: stock.rec2, 
        rec3: stock.rec3,
      };
    });

    return res.status(200).json({
      status: "success",
      stocks: modifiedStocks,
    });
  } catch (error) {
    return res.status(200).json({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.resetAccount = async (req, res) => {
  try {
    if (req.user !== req.params.userId) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const stocks = await Stock.find({ userId: req.params.userId });
    stocks.forEach(async (stock) => {
      await Stock.findByIdAndDelete(stock._id);
    });

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
      balance: 100000,
    });

    return res.status(200).json({
      status: "success",
      user: {
        username: updatedUser.username,
        id: updatedUser._id,
        balance: 100000,
      },
    });
  } catch (error) {
    return res.status(200).json({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.recommend = async (req, res) => {
  try{
    const { ticker } = req.body;

    const tickers = await Recommendation.findById(ticker);

    if (!tickers) {
      return res.status(200).json({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    return res.status(200).json({
      status: "success",
      user: {
        username: updatedUser.username,
        id: updatedUser._id,
        balance:
          Math.round((user.balance + saleProfit) * 100) / 100,
      },
      rec1: tickers.rec1
    });

  } catch (error) {
    return res.status(200).json({
      status: "fail",
      message: "Something unexpected happened."
    });
  }
};
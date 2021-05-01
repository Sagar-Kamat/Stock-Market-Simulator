const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  ticker: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  rec1: {
    type: String,
    required: true,
  },
  rec2: {
    type: String,
    required: true,
  },
  rec3: {
    type: String,
    required: true,
  },
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;

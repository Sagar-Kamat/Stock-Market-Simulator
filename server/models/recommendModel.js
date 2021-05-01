const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recommendStock = new Schema({
  ticker: {
    type: String,
    required: true,
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

const Recommendation = mongoose.model("Recommendation", recommendStock);

module.exports = Recommendation;

const express = require("express");
const router = express.Router();
const auth = require("../controllers/authMiddleware");
const { purchaseStock, sellStock, getStockForUser, resetAccount, recommend } = require("../controllers/stockController");

router.route("/").post(auth, purchaseStock);
router.route("/").patch(auth, sellStock)
router.route("/:userId").get(auth, getStockForUser);
router.route("/:userId").delete(auth, resetAccount);
router.route("/recommend").get(auth, recommend);

module.exports = router;

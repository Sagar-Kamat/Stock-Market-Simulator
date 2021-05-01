const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const nodemailer = require("../config/nodemailer.config");
// const {JWT_SECRET} = require("../config/")
require("dotenv").config();

const errorMessage = (res, error) => {
  return res.status(400).json({ status: "fail", message: error.message });
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email ||!password) {
      return res.status(200).json({
        status: "fail",
        message: "Not all fields have been entered",
      });
    }
    if (password.length < 6 || password.length > 25) {
      return res.status(200).json({
        status: "fail",
        message: "Password must be between 6-25 characters",
        type: "password",
      });
    }

    const existingUser_username = await User.findOne({ username });
    if (existingUser_username) {
      return res.status(200).json({
        status: "fail",
        message: "An account with this username already exists.",
        type: "username",
      });
    }

    const existingUser_email = await User.findOne({ email });
    if (existingUser_email) {
      return res.status(200).json({
        status: "fail",
        message: "An account with this email already exists.",
        type: "email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = jwt.sign({ email: req.body.email }, config.secret);

    const newUser = new User({ username, email, password: hashedPassword, confirmationCode:token });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

    nodemailer.sendConfirmationEmail(
      newUser.username,
      newUser.email,
      newUser.confirmationCode
    );
    // res.redirect("/");
  } catch (error) {
    return errorMessage(res, error);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({
        // status: "fail",
        message: "Not all fields have been entered.",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(200).json({
        status: "fail",
        accessToken: null,
        message: "Invalid credentials. Please try again.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // alert("Invalid credentials. Please try again.");
      // res.redirect("/login");
      return res.status(200).json({
        status: "fail",
        message: "Invalid credentials. Please try again.",
      });
    }

    if (user.status != "Active") {
      // alert("Pending Account. Please Verify Your Email!");
      // res.redirect("/login");
      return res.status(200).send({
        status: "fail",
        message: "Pending Account. Please Verify Your Email!",
      });
    }

    const token = jwt.sign({ id: user._id },  config.secret, {
      expiresIn: 86400, // 24 hours
    });

    return res.status(200).json({
      token,
      user: {
        username,
        id: user._id,
        balance: user.balance,
        email: user.email,
        accessToken: token,
        status: user.status
      },
    });
  } catch (error) {
    return errorMessage(res, error);
  }
};

exports.validate = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, config.secret);
    if (!verified) {
      return res.json(false);
    }

    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error) {
    return res.json(false);
  }
};

exports.verifyUser = (req, res) => {
  User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      user.status = "Active";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }else{
          console.log(user.status);
          res.redirect("http://localhost:3000/login");
        }
      });
    })
    .catch((e) => console.log("error", e));
  };
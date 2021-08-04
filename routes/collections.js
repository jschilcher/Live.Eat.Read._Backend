const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

module.exports = router;
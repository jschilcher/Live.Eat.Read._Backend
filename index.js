const connectDB = require("./startup/db");
const express = require("express");
const app = express();
const cors = require("cors");
const collections = require("./routes/collections");
const auth = require("./routes/auth");
const images = require("./routes/images");
// const pictures = require("./public/images")

connectDB();

app.use(express.json());
app.use(cors());
app.use("/api/collections", collections);
app.use("/api/auth", auth);
app.use("/api/images", images);
// app.use("/api/public/images", express.static("public"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const recordRouter = require("./routes/record");
const recordsRouter = require("./routes/records");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/record", recordRouter);
app.use("/api/records", recordsRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Mirim Guinness Backend",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 실행: http://localhost:${PORT}`);
});

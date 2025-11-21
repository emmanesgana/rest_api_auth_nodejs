const express = require("express");

const app = express();
const PORT = 3000;

const indexRouter = require("./routes/indexRouter.js");
const authRouter = require("./routes/authRoutes.js");

app.use(express.json());

app.use("/", indexRouter);
app.use("/api", authRouter);

app.listen(PORT, () => console.log(`Server is running on PORT:${PORT}`));
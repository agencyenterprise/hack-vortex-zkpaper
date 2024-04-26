import dotenv from "dotenv";
dotenv.config();

import express from "express";
import router from "./router";

const app = express();

app.use(express.json());

app.use('/api', router);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server running on port ${process.env.BACKEND_PORT}`);
});


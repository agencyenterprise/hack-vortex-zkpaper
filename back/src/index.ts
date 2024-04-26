import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import express from "express";
import router from "./router";

const app = express();
app.use(cors())
app.use(express.json());

app.use('/api', router);

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server running on port ${process.env.BACKEND_PORT}`);
});


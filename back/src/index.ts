import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import express from "express";
import router from "./router";

const app = express();
app.use(cors())
app.use(express.json());

app.use('/api', router);
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


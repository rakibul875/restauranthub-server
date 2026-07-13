import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req: Request, res: Response) => {
  res.send("RestaurantHub Server is Running...");
});

// Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
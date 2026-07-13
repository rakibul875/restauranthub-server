import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function run() {
  try {
    await client.connect();
    const database = client.db("restauranthub");
    const userCollection = database.collection("user");
    const itemCollection = database.collection("items");

    app.get("/users", async (req: Request, res: Response) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.get('/items/:id',async (req:Request,res:Response)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const item = await itemCollection.findOne(query);
      res.send(item);
    })

    app.get("/items", async (req: Request, res: Response) => {
      try {
        const { search, category } = req.query;
        let query: any = {};
        if (search) {
          query.name = { $regex: search, $options: "i" };
        }

        if (category && category !== "All") {
          query.category = category;
        }
        const items = await itemCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.send(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    app.post("/items", async (req: Request, res: Response) => {
      const item = req.body;
      const newItem = {
        ...item,
        createdAt: new Date(),
      };
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req: Request, res: Response) => {
  res.send("RestaurantHub Server is Running...");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

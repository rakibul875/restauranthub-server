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
    // await client.connect();
    const database = client.db("restauranthub");
    const userCollection = database.collection("user");
    const itemCollection = database.collection("items");
    const addToCartCollection = database.collection("cart");
    const subscriptionCollection = database.collection("subscription");
    const orderCollection = database.collection("orders");

    // app.get("/users", async (req: Request, res: Response) => {
    //   const users = await userCollection.find().toArray();
    //   res.send(users);
    // });
    app.delete("/my-order/:id", async (req: Request, res: Response) => {
      const { id } = req.params;

      const filter = {
        _id: new ObjectId(id),
      };

      const result = await orderCollection.deleteOne(filter);

      res.send(result);
    });
    app.get("/my-order", async (req: Request, res: Response) => {
      const query: any = {};
      if (req.query.userId) {
        query.userId = req.query.userId;
      }
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/order", async (req: Request, res: Response) => {
      const data = req.body;
      const isExist = await orderCollection.findOne({
        sessionId: data.sessionId,
      });
      if (isExist) {
        return res.send({
          success: true,
          message: "Subscription already exists",
        });
      }
      const newData = {
        ...data,
        orderAt: new Date(),
      };
      const result = await orderCollection.insertOne(newData);
      res.send(result);
    });
    app.post("/subscription", async (req: Request, res: Response) => {
      const data = req.body;
      const isExist = await subscriptionCollection.findOne({
        sessionId: data.sessionId,
      });
      if (isExist) {
        return res.send({
          success: true,
          message: "Subscription already exists",
        });
      }
      const newData = {
        ...data,
        subscriptionAt: new Date(),
      };
      const result = await subscriptionCollection.insertOne(newData);
      res.send(result);
    });

    app.delete("/my-cart/user/:userId", async (req: Request, res: Response) => {
      const { userId } = req.params;

      const result = await addToCartCollection.deleteMany({ userId });

      res.send({
        success: true,
        deletedCount: result.deletedCount,
      });
    });

    app.delete("/my-cart/:id", async (req: Request, res: Response) => {
      const { id } = req.params;
      console.log(id);

      const filter = {
        _id: new ObjectId(id),
      };

      const result = await addToCartCollection.deleteOne(filter);
      console.log(result);

      res.send(result);
    });
    app.get("/my-cart", async (req: Request, res: Response) => {
      const query: any = {};

      if (req.query.userId) {
        query.userId = req.query.userId;
      }

      const cartItems = await addToCartCollection.find(query).toArray();

      res.send(cartItems);
    });
    app.post("/cart", async (req: Request, res: Response) => {
      const cartItem = req.body;
      const result = await addToCartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.get("/items/:id", async (req: Request, res: Response) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const item = await itemCollection.findOne(query);
      res.send(item);
    });
    app.get("/latest-items", async (req: Request, res: Response) => {
      const result = await itemCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .toArray();

      res.send(result);
    });
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

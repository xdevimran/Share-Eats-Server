const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://b8a11.netlify.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// MongoDB connection string with environment variables
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.iitamdp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const foodCollection = client.db("shareeats").collection("food");
    const requestCollection = client.db("shareeats").collection("request");

    // Post New Request
    app.post("/addrequest", async (req, res) => {
      const request = req.body;
      const result = await requestCollection.insertOne(request);
      res.send(result);
    });

    // Get All Requests
    app.get("/requests", async (req, res) => {
      const requests = await requestCollection.find(req.query).toArray();
      res.send(requests);
    });

    // Get Single Request by id
    app.get("/request/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const request = await requestCollection.findOne(filter);
      res.send(request);
    });

    // Update Request  food
    app.put("/request/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const result = await requestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFood }
      );
      if (result.modifiedCount === 1) {
        res.send(`updatedFood with id ${id} updated successfully`);
      } else {
        res.status(404).send(`updatedFood with id ${id} not found`);
      }
    });

    // Delete a single request
    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    // Post New Food
    app.post("/addfood", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // Get All Food
    app.get("/allfood", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get All food by decending order
    app.get("/allfoodquntity", async (req, res) => {
      try {
        const requests = await foodCollection.find(req.query).toArray();
        requests.forEach((item) => {
          if (!isNaN(item.foodQuantity)) {
            item.foodQuantity = parseInt(item.foodQuantity);
          }
        });

        // Sort by foodQuantity in descending order
        requests.sort((a, b) => {
          if (a.foodQuantity > b.foodQuantity) return -1;
          if (a.foodQuantity < b.foodQuantity) return 1;
          return 0;
        });

        res.send(requests);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Get Single Food by id
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    // Update Food
    app.put("/updatefood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedFood = req.body;
      const updatedDoc = {
        $set: {
          name: updatedFood.name,
          image: updatedFood.image,
          price: updatedFood.price,
          description: updatedFood.description,
        },
      };
      const result = await foodCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

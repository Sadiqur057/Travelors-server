const express = require("express");
const cors = require("cors");
require("dotenv").config;
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

// Travelors-admin
// eg6EB0Telg2KjFYx
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x7pm4nr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const touristSpotCollection = client
      .db("Travelors")
      .collection("tourist-spots");
    const countryCollection = client.db("Travelors").collection("countries");
    const userCollection = client.db("Travelors").collection("users");

    app.get("/tourist-spots", async (req, res) => {
      const result = await touristSpotCollection.find().toArray();
      res.send(result);
    });

    app.get("/spot-counts", async (req, res) => {
      const result = await touristSpotCollection.countDocuments();
      res.json({ count: result });
    });

    app.get("/country-counts", async (req, res) => {
      const result = await countryCollection.countDocuments();
      res.json({ count: result });
    });

    app.get("/user-counts", async (req, res) => {
      const result = await userCollection.countDocuments();
      res.json({ count: result });
    });

    app.get("/tourist-spots/:email", async (req, res) => {
      const email = req.params.email
      const cursor = { email : email}
      const result = await touristSpotCollection.find(cursor).toArray();
      res.send(result);
    });

    app.get("/countries", async (req, res) => {
      const result = await countryCollection.find().toArray();
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.findOne(query);
      res.send(result);
    });

    app.get("/countries/:name", async (req, res) => {
      const name = req.params.name;
      const query = { country: name };
      console.log(req.params.name);
      const cursor = touristSpotCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/country/:name", async (req, res) => {
      const name = req.params.name;
      const query = { name: name };
      console.log(req.params.name);
      const result = await countryCollection.findOne(query);
      res.send(result);
    });

    app.post("/tourist-spots", async (req, res) => {
      const touristData = req.body;
      console.log(touristData);
      const result = await touristSpotCollection.insertOne(touristData);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const existingUser = await userCollection.findOne({ email: userData.email });
      if(existingUser){
        return ;
      }
      console.log(userData);
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const touristData = req.body;
      const id = touristData._id;
      const spotName = touristData.spot_name;
      const visitors = touristData.visitors;
      const country = touristData.country;
      const location = touristData.location;
      const description = touristData.description;
      const seasonality = touristData.seasonality;
      const cost = touristData.cost;
      const travelTime = touristData.travelTime;
      const image = touristData.image;
      console.log(spotName)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };
      const updateTouristSpot = {
        $set: {
          spot_name: spotName,
          visitors: visitors,
          country: country,
          location: location,
          description: description,
          seasonality: seasonality,
          cost: cost,
          travelTime: travelTime,
          image:image
        },
      };
      const result = await touristSpotCollection.updateOne(filter,updateTouristSpot, options)
      console.log(result)
      res.send(result)
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Server is running and ok");
});

app.listen(port, () => {
  console.log(`server is running at ${port}`);
});

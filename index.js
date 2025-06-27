const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const bodyParser = require('body-parser');

// middleware
app.use(cors())
app.use(express.json())
app.use(bodyParser.json()); 

// poloka11
// jepfC2dd2bBRoX0h



const uri = "mongodb+srv://poloka11:jepfC2dd2bBRoX0h@cluster0.fpvzj8u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("BookHotel");
    const roomCollection = database.collection('BookData');
    const bookingCollection = database.collection('Bookings');
    const reviewCollection = database.collection('Reviews');
    const userCollection = database.collection('Users');

       // Get All Room
    app.get("/rooms", async (req, res) => {
      const cursor = roomCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    
    // Get Single Room Details
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomCollection.findOne(query);
      res.send(result);
    })

    // Bookings API
    app.post('/bookings', async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData)
      res.send(result);
    })


      app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { bookedBy: email };
      }
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    // Get booked dates
    app.get('/bookings/:id', async (req, res) => {
      const roomId = req.params.id;
      const query = { roomId }; // Assuming roomId is stored in booking documents
      try {
        const bookings = await bookingCollection.find(query).toArray();
        const bookedDates = bookings.map(booking => {
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);

          const dates = [];
          while (start <= end) {
            dates.push(new Date(start).toISOString().split('T')[0]);
            start.setDate(start.getDate() + 1);
          }
          return dates;
        }).flat(); 
        res.send(bookedDates);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch booked dates.' });
      }
    });



    
    // Express route to update the end date of a booking
    app.put('/bookings/update-end-date/:id', async (req, res) => {
      const bookingId = req.params.id;
      const { endDate } = req.body;

      try {
        const result = await bookingCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { endDate: new Date(endDate) } } // Update the end date in MongoDB
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking updated successfully' });
      } catch (error) {
        console.error('Error updating booking end date:', error);
        res.status(500).json({ message: 'Error updating booking end date' });
      }
    });


     // delete

    app.delete('/bookings/cancel/:id', async (req, res) => {
      const bookingId = req.params.id;

      try {
        const result = await bookingCollection.deleteOne({ _id: new ObjectId(bookingId) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking canceled successfully' });
      } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking' });
      }
    });


  




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on("error", (err) => {
  if (err.code == "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
  }
});
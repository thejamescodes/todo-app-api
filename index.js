const express = require("express");
const admin = require("firebase-admin");
const cors = require('cors');
const app = express();
require('dotenv').config();


const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Load the service account key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);


// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Middleware to parse JSON requests
app.use(express.json());

// Sample route
app.get("/todos", async (req, res) => {
  try {
    const snapshot = await db.collection("todos").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/todos", async (req, res) => {
    try {
      const { text, datetime } = req.body;
  
      if (!text || !datetime) {
        return res.status(400).json({ error: "Both 'text' and 'datetime' are required." });
      }
  
      const todo = { text, datetime };
      const docRef = await db.collection("todos").add(todo);
  
      res.status(201).json({ id: docRef.id, ...todo });
    } catch (error) {
      console.error("Error creating to-do:", error);
      res.status(500).json({ error: "Failed to create to-do." });
    }
  });

  app.get("/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await db.collection("todos").doc(id).get();
  
      if (!doc.exists) {
        return res.status(404).json({ error: "To-do not found." });
      }
  
      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error fetching to-do:", error);
      res.status(500).json({ error: "Failed to fetch to-do." });
    }
  });

  app.put("/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { text, datetime } = req.body;
  
      if (!text && !datetime) {
        return res.status(400).json({ error: "At least one of 'text' or 'datetime' must be provided." });
      }
  
      const updatedFields = {};
      if (text) updatedFields.text = text;
      if (datetime) updatedFields.datetime = datetime;
  
      await db.collection("todos").doc(id).update(updatedFields);
  
      res.status(200).json({ message: "To-do updated successfully.", id, ...updatedFields });
    } catch (error) {
      console.error("Error updating to-do:", error);
      res.status(500).json({ error: "Failed to update to-do." });
    }
  });

  app.delete("/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      await db.collection("todos").doc(id).delete();
  
      res.status(200).json({ message: "To-do deleted successfully." });
    } catch (error) {
      console.error("Error deleting to-do:", error);
      res.status(500).json({ error: "Failed to delete to-do." });
    }
  });
  
// Start server

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

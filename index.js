const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");

dotenv.config();

// Ensure that the MongoDB connection string includes the correct write concern mode 'majority'
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, w: 'majority' })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1); // Exit the process if there's an issue with the MongoDB connection
  });

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

const PORT = process.env.PORT || 8800;

// Check if the MongoDB connection is successful before starting the server
mongoose.connection.on('connected', () => {
  app.listen(8800, () => {
    console.log(`Backend server is running `);
  });
});

mongoose.connection.on('error', (err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1); // Exit the process if there's an error with the MongoDB connection
});
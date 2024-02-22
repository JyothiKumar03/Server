const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdminRoute = require("./routes/admins");
const userRoute = require("./routes/users");
const ExamRoute = require("./routes/exams");
const bodyParser = require("body-parser");

dotenv.config();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
// Ensure that the MongoDB connection string includes the correct write concern mode 'majority'
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    w: "majority",
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1); // Exit the process if there's an issue with the MongoDB connection
  });

app.use(express.json());
app.use(cors());

app.use("/Server/admin/", AdminRoute);
app.use("/Server/user/", userRoute);
app.use("/exams/", ExamRoute);

app.get("/", (req, res) => {
  res.send("The server is running!!");
});

const PORT = process.env.PORT || 8800;

// Check if the MongoDB connection is successful before starting the server
mongoose.connection.on("connected", () => {
  app.listen(8800, () => {
    console.log(`Backend server is running at http://localhost:` + PORT);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1); // Exit the process if there's an error with the MongoDB connection
});

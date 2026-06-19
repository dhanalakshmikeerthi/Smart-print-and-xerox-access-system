const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((error) => {
    console.log(
      "MongoDB Error ❌",
      error.message
    );
  });

/* =========================
   ROUTES IMPORT
========================= */

const otpRoutes =
  require("./routes/otpRoutes");

const userRoutes =
  require("./routes/userRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const uploadRoutes =
  require("./routes/uploadRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/otp",
  otpRoutes
);

app.use(
  "/api",
  userRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

/* =========================
   STATIC FILES
========================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {
  res.send(`
    <h1>Smart Print Backend Running 🚀</h1>

    <a href="/test">
      Test API
    </a>

    <br/><br/>

    <a href="/api/users">
      View Users
    </a>

    <br/><br/>

    <a href="/api/orders">
      View Orders
    </a>

    <br/><br/>

    <a href="/api/upload">
      Upload API
    </a>
  `);
});

/* =========================
   TEST ROUTE
========================= */

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message:
      "API Working Properly",
  });
});

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
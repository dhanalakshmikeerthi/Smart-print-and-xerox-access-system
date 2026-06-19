const dotenv = require("dotenv");

dotenv.config();
const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const app = express();

// MIDDLEWARE

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));



const otpRoutes =
require("./routes/otpRoutes");

app.use(
  "/api/otp",
  otpRoutes
);

// DATABASE CONNECTION

mongoose.connect(process.env.MONGO_URI)

  .then(() => {

    console.log(
      "MongoDB Connected ✅"
    );
  })

  .catch((error) => {

    console.log(
      "MongoDB Error ❌",
      error.message
    );
  });

// ROUTES

const userRoutes =
  require("./routes/userRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const uploadRoutes =
  require("./routes/uploadRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const os = require("os");
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

app.get("/api/server-info", (req, res) => {
  res.json({
    localIp: getLocalIp(),
    port: 5173
  });
});

const path = require("path");

// API ROUTES

app.use(
  "/api",
  userRoutes
);

// Serve uploaded files (for local storage / fallback)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(
  "/api/orders",
  orderRoutes
);

// IMPORTANT UPLOAD ROUTE

app.use(
  "/api/upload",
  uploadRoutes
);

// PAYMENT ROUTE

app.use(
  "/api/payment",
  paymentRoutes
);

// HOME ROUTE

app.get("/", (req, res) => {

  res.send(`
  
    <h1>
      Smart Print Backend Running 🚀
    </h1>

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

// TEST ROUTE

app.get("/test", (req, res) => {

  res.json({

    success: true,

    message:
      "API Working Properly"
  });
});

// SERVER

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on ${PORT}`
  );
});
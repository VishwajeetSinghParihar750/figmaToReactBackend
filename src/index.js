// server.js or app.js

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

// routes
import walletRoute from "./routes/wallet.js";
import authRoute from "./routes/auth.js";

import "./strategies/discord.js";

const PORT = process.env.PORT || 5000;
const app = express();

// middlewares
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, origin); // origin can be undefined when the request is from the same origin
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev")); // gives data about incoming requests on console

// session configuration
app.use(
  session({
    secret: "default_secret", // Use an environment variable for the secret
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 60 * 24 },
    resave: true,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// Use a synchronous function to dynamically import routes
app.use("/api/auth", authRoute);
app.use("/api", walletRoute);

// Start server after routes are imported
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("uncaughtException", (e) => console.log(e));

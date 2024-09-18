import express from "express";
import path, { dirname, join } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid"; // Import uuid
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

const PORT = process.env.PORT || 5000;
const app = express();
const router = express.Router();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletFilePath = join(__dirname, "db", "wallets.json");

// Helper function to read wallets from file
const readWalletsFromFile = () => {
  try {
    const data = fs.readFileSync(walletFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading wallets file:", error);
    return [];
  }
};

// Helper function to write wallets to file
const writeWalletsToFile = (wallets) => {
  try {
    fs.writeFileSync(walletFilePath, JSON.stringify(wallets, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to wallets file:", error);
  }
};

// Get all wallets
router.get("/wallets", (req, res) => {
  const wallets = readWalletsFromFile();
  res.json(wallets);
});

// Add a new wallet
router.post("/wallets", (req, res) => {
  const newWallet = req.body;
  newWallet.id = uuidv4(); // Generate a unique ID for the new wallet
  newWallet.balance = "$0";
  newWallet.status = "Active";

  const wallets = readWalletsFromFile();
  wallets.push(newWallet);
  writeWalletsToFile(wallets);
  res.status(201).json(newWallet);
});

// Edit a wallet
router.put("/wallets/:id", (req, res) => {
  const { id } = req.params;
  const updatedWallet = req.body;
  const wallets = readWalletsFromFile();
  const index = wallets.findIndex((wallet) => wallet.id === id);

  if (index !== -1) {
    wallets[index] = { ...wallets[index], ...updatedWallet };
    writeWalletsToFile(wallets);
    res.json(wallets[index]);
  } else {
    res.status(404).json({ message: "Wallet not found" });
  }
});

// Delete a wallet
router.delete("/wallets/:id", (req, res) => {
  const { id } = req.params;
  const wallets = readWalletsFromFile();
  const newWallets = wallets.filter((wallet) => wallet.id !== id);

  if (newWallets.length !== wallets.length) {
    writeWalletsToFile(newWallets);
    res.json({ message: "Wallet deleted" });
  } else {
    res.status(404).json({ message: "Wallet not found" });
  }
});

app.use("/api", router);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("uncaughtException", (e) => console.log(e));

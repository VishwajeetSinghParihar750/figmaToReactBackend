// routes/wallet.js

import { Router } from "express";
import path, { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { fileURLToPath } from "url";
import { checkAuthenticated } from "../middlewares/checkAuthenticated.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletFilePath = join(__dirname, "../", "db", "wallets.json");

const readWalletsFromFile = () => {
  try {
    const data = fs.readFileSync(walletFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading wallets file:", error);
    return [];
  }
};

const writeWalletsToFile = (wallets) => {
  try {
    fs.writeFileSync(walletFilePath, JSON.stringify(wallets, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to wallets file:", error);
  }
};

router.get("/wallets", checkAuthenticated, (req, res) => {
  const userId = req.user.id;
  const wallets = readWalletsFromFile();
  const userWallets = wallets.filter((wallet) => wallet.userId == userId);
  res.json(userWallets);
});

router.post("/wallets", checkAuthenticated, (req, res) => {
  console.log(req.cookies);
  const userId = req.user.id;

  console.log(req.body);
  const newWallet = req.body;
  // const wallets = [];
  newWallet.id = uuidv4();
  newWallet.userId = userId;
  newWallet.balance = "$0";
  newWallet.status = "Active";

  const wallets = readWalletsFromFile();
  wallets.push(newWallet);
  // writeWalletsToFile(wallets);
  res.status(201).json(newWallet);
});

router.put("/wallets/:id", checkAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updatedWallet = req.body;
  const wallets = readWalletsFromFile();
  const index = wallets.findIndex((wallet) => wallet.id === id);

  if (index !== -1) {
    if (wallets[index].userId === userId) {
      wallets[index] = { ...wallets[index], ...updatedWallet };
      writeWalletsToFile(wallets);
      res.json(wallets[index]);
    } else {
      res.status(403).json({ message: "Not authorized to edit this wallet" });
    }
  } else {
    res.status(404).json({ message: "Wallet not found" });
  }
});

router.delete("/wallets/:id", checkAuthenticated, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const wallets = readWalletsFromFile();
  const walletIndex = wallets.findIndex((wallet) => wallet.id == id);

  if (walletIndex !== -1) {
    if (wallets[walletIndex].userId == userId) {
      wallets.splice(walletIndex, 1);
      writeWalletsToFile(wallets);
      res.json({ message: "Wallet deleted" });
    } else {
      res.status(403).json({ message: "Not authorized to delete this wallet" });
    }
  } else {
    res.status(404).json({ message: "Wallet not found" });
  }
});

export default router;

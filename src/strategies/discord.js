import { Strategy as DiscordStrategy } from "passport-discord";
import passport from "passport";
import { fileURLToPath } from "url";
import fs from "fs";
import path, { dirname } from "path";

import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const usersPath = path.join(__dirname, "../db/users.json");

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CLIENT_REDIRECT,
      scope: ["identify", "guilds"],
    },
    function (accessToken, refreshToken, profile, cb) {
      const users = readUsersFromFile();

      let user = users.find((u) => u.id == profile.id);
      if (!user) {
        user = {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar,
        };

        const newUsers = [user, ...users];
        writeUsersToFile(newUsers);
      }

      cb(null, user); // Call cb with the user object
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = readUsersFromFile(); // Ensure this function reads users correctly
  const user = users.find((u) => u.id == id);
  done(null, user);
});

// Helper function to read users from file
const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

// Helper function to write users to file
const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to users file:", error);
  }
};

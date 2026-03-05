import { pool, db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const usersToSeed = [];

  const user1Username = process.env.USER1_USERNAME;
  const user1Password = process.env.USER1_PASSWORD;
  const user1DisplayName = process.env.USER1_DISPLAY_NAME;

  if (user1Username && user1Password && user1DisplayName) {
    usersToSeed.push({
      username: user1Username,
      passwordHash: await bcrypt.hash(user1Password, 12),
      displayName: user1DisplayName,
    });
  }

  const user2Username = process.env.USER2_USERNAME;
  const user2Password = process.env.USER2_PASSWORD;
  const user2DisplayName = process.env.USER2_DISPLAY_NAME;

  if (user2Username && user2Password && user2DisplayName) {
    usersToSeed.push({
      username: user2Username,
      passwordHash: await bcrypt.hash(user2Password, 12),
      displayName: user2DisplayName,
    });
  }

  if (usersToSeed.length === 0) {
    console.log("No users configured in environment variables.");
    await pool.end();
    return;
  }

  for (const userData of usersToSeed) {
    await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.username,
        set: {
          passwordHash: userData.passwordHash,
          displayName: userData.displayName,
        },
      });
    console.log("Seeded user successfully");
  }

  console.log("Seeding complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

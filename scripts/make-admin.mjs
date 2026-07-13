import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (users.length === 0) {
    console.log("No users found in the database.");
    console.log("Go to http://localhost:3000/auth and register — the first user will automatically become ADMIN.");
  } else {
    console.log("\nAll users in the database:");
    users.forEach((u, i) => {
      console.log(`  [${i + 1}] ${u.email}  role=${u.role}  active=${u.isActive}  id=${u.id}`);
    });

    // Promote the first user to ADMIN
    const first = users[0];
    if (first.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: first.id },
        data: { role: "ADMIN" },
      });
      console.log(`\n✅ Promoted "${first.email}" to ADMIN.`);
    } else {
      console.log(`\n✅ "${first.email}" is already ADMIN.`);
    }
    console.log(`\nLog in at http://localhost:3000/auth with: ${first.email}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

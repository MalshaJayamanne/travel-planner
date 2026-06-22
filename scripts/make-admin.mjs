import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (users.length === 0) {
    console.log("No users found in the database.");
    console.log("Go to http://localhost:3000/auth/register and register — the first user will automatically become ADMIN.");
  } else {
    console.log("\nAll users:");
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
    console.log(`\nLog in at http://localhost:3000/auth/login with: ${first.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

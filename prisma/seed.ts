import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const todos = [
  { title: "Buy groceries for the week", completed: false, order: 10 },
  { title: "Finish quarterly report", completed: true, order: 20 },
  { title: "Schedule dentist appointment", completed: false, order: 30 },
  { title: "Review pull requests", completed: true, order: 40 },
  { title: "Plan weekend trip to the mountains", completed: false, order: 50 },
];

async function main() {
  console.log("🌱 Checking if database has been seeded...");

  // Check if database has been seeded before
  const seedHistory = await prisma.seedHistory.findFirst();

  if (seedHistory) {
    console.log(
      `📚 Database was already seeded at ${seedHistory.seededAt.toISOString()}. Skipping.`
    );
    return;
  }

  console.log("🌱 Seeding database with initial data...");

  // Create new todos
  for (const todo of todos) {
    await prisma.todo.create({
      data: todo,
    });
  }

  // Mark database as seeded
  await prisma.seedHistory.create({
    data: {},
  });

  console.log(`✅ Created ${todos.length} todos`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

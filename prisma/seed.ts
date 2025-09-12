import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: true,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    emailVerified: true,
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
];

const todos = [
  {
    title: "Buy groceries for the week",
    completed: false,
    order: 10,
    userId: "user_1",
  },
  {
    title: "Finish quarterly report",
    completed: true,
    order: 20,
    userId: "user_1",
  },
  {
    title: "Schedule dentist appointment",
    completed: false,
    order: 30,
    userId: "user_1",
  },
  {
    title: "Review pull requests",
    completed: true,
    order: 40,
    userId: "user_2",
  },
  {
    title: "Plan weekend trip to the mountains",
    completed: false,
    order: 50,
    userId: "user_2",
  },
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

  // Create users first
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // Create todos associated with users
  for (const todo of todos) {
    await prisma.todo.create({
      data: todo,
    });
  }

  // Mark database as seeded
  await prisma.seedHistory.create({
    data: {},
  });

  console.log(`✅ Created ${users.length} users and ${todos.length} todos`);
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

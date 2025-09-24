import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "../generated/client/client";

const instantiatePrisma = () => {
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter }).$extends(withAccelerate());
};

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof instantiatePrisma>;
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = globalForPrisma.prisma || instantiatePrisma();
} else {
  globalForPrisma.prisma = instantiatePrisma();
}

const prisma = globalForPrisma.prisma;

export { prisma };

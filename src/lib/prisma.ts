import { randomUUID } from "crypto";

type UserRecord = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  image: string | null;
  createdAt: Date;
};

type TripRecord = {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  userId: string;
  createdAt: Date;
};

type ExpenseRecord = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  tripId: string;
  userId: string;
};

const memoryStore = {
  users: new Map<string, UserRecord>(),
  trips: [] as TripRecord[],
  expenses: [] as ExpenseRecord[],
};

const globalForPrisma = globalThis as unknown as {
  prisma: unknown;
};

function selectFields<T extends Record<string, unknown>>(record: T, select?: Record<string, boolean>) {
  if (!select) {
    return record;
  }

  const selectedEntries = Object.entries(record).filter(([key]) => select[key]);
  return Object.fromEntries(selectedEntries) as Partial<T>;
}

export const prisma: any = globalForPrisma.prisma ?? {
  user: {
    async findUnique(args?: { where?: { email?: string; id?: string } }) {
      const where = args?.where ?? {};

      if (where.email) {
        return memoryStore.users.get(where.email) ?? null;
      }

      if (where.id) {
        return Array.from(memoryStore.users.values()).find((user) => user.id === where.id) ?? null;
      }

      return null;
    },
    async create(args: { data: Partial<UserRecord>; select?: Record<string, boolean> }) {
      const email = args.data.email ?? "";
      const record: UserRecord = {
        id: randomUUID(),
        name: args.data.name ?? null,
        email,
        passwordHash: args.data.passwordHash ?? "",
        image: args.data.image ?? null,
        createdAt: new Date(),
      };

      memoryStore.users.set(email, record);
      return selectFields(record, args.select);
    },
    async count() {
      return memoryStore.users.size;
    },
  },
  trip: {
    async create(args: { data: Partial<TripRecord> }) {
      const record: TripRecord = {
        id: randomUUID(),
        title: args.data.title ?? "",
        destination: args.data.destination ?? "",
        startDate: args.data.startDate ?? new Date(),
        endDate: args.data.endDate ?? new Date(),
        budget: args.data.budget ?? 0,
        userId: args.data.userId ?? "",
        createdAt: new Date(),
      };

      memoryStore.trips.push(record);
      return record;
    },
    async findMany(args?: { where?: { userId?: string }; orderBy?: { createdAt: "desc" | "asc" } }) {
      const { where } = args ?? {};
      const trips = memoryStore.trips.filter((trip) => !where?.userId || trip.userId === where.userId);
      return trips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    async count() {
      return memoryStore.trips.length;
    },
  },
  expense: {
    async count() {
      return memoryStore.expenses.length;
    },
  },
  $queryRaw: async () => [{ result: 1 }],
  $connect: async () => undefined,
  $disconnect: async () => undefined,
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUserRecord(input: {
  name: string | null;
  email: string;
  passwordHash: string;
  image?: string | null;
}) {
  return prisma.user.create({
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
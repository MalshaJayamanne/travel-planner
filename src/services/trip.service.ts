import { prisma } from "@/lib/prisma";

export const TripService = {
  create: async (data: any) => {
    return prisma.trip.create({ data });
  },

  getAll: async () => {
    return prisma.trip.findMany();
  },
};
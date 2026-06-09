import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const TripService = {
  create: async (data: Prisma.TripCreateInput) => {
    return prisma.trip.create({ data });
  },

  getAll: async () => {
    return prisma.trip.findMany();
  },
};
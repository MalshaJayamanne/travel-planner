import { prisma } from "@/lib/prisma";
import type { Trip } from "@/types/trip";

type CreateTripInput = Omit<Trip, "id">;

export const TripService = {
  create: async (data: CreateTripInput) => {
    return prisma.trip.create({ data });
  },

  getAll: async () => {
    return prisma.trip.findMany();
  },
};

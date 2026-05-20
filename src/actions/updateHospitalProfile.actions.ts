"use server";

import { prisma } from "@/lib/db";

import { getCurrentUser } from "@/lib/getUser";

export async function updateHospitalProfile(
  payload: {
    hospitalName: string;

    industry: string;

    country: string;

    state: string;

    builtUpArea: number;

    numberOfBeds: number;

    numberOfEmployees: number;

    averageDailyOccupancy: number;

    operatingHours: number;

    numberOfFloors: number;

    yearEstablished: number;
  }
) {
  const user =
    await getCurrentUser();

  if (!user?.hospitalId) {
    throw new Error(
      "Unauthorized"
    );
  }

  return await prisma.hospital.update(
    {
      where: {
        id: String(
          user.hospitalId
        ),
      },

      data: {
        hospitalName:
          payload.hospitalName,

        industry:
          payload.industry,

        country:
          payload.country,

        state: payload.state,

        builtUpArea:
          Number(
            payload.builtUpArea
          ),

        numberOfBeds:
          Number(
            payload.numberOfBeds
          ),

        numberOfEmployees:
          Number(
            payload.numberOfEmployees
          ),

        averageDailyOccupancy:
          Number(
            payload.averageDailyOccupancy
          ),

        operatingHours:
          Number(
            payload.operatingHours
          ),

        numberOfFloors:
          Number(
            payload.numberOfFloors
          ),

        yearEstablished:
          Number(
            payload.yearEstablished
          ),
      },
    }
  );
}
type MockModel = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  update: jest.Mock;
  create: jest.Mock;
};

export type MockPrismaClient = {
  hospital: Pick<MockModel, "findMany" | "findUnique" | "findFirst">;
  user: Pick<MockModel, "findMany" | "findUnique" | "update">;
  upload: Pick<MockModel, "findMany">;
  adminAuditLog: Pick<MockModel, "create">;
  benchmarkMaster: Pick<MockModel, "findMany" | "findUnique" | "update">;
  emissionFactor: Pick<MockModel, "findMany" | "findUnique" | "update">;
  confidenceThreshold: Pick<MockModel, "findMany" | "findUnique" | "update">;
  certificationApplicability: Pick<MockModel, "findMany" | "findUnique" | "update">;
  scoringWeight: Pick<MockModel, "findMany">;
  annualizationModifier: Pick<MockModel, "findMany">;
  electricityData: Pick<MockModel, "findMany">;
  waterData: Pick<MockModel, "findMany">;
  fuelData: Pick<MockModel, "findMany">;
  wasteData: Pick<MockModel, "findMany">;
  refrigerantData: Pick<MockModel, "findMany">;
  transportData: Pick<MockModel, "findMany">;
  governanceData: Pick<MockModel, "findUnique">;
};

function createModel(overrides: Partial<MockModel> = {}): MockModel {
  return {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    ...overrides,
  };
}

export function createMockPrisma(overrides: Partial<MockPrismaClient> = {}): MockPrismaClient {
  return {
    hospital: createModel(),
    user: createModel(),
    upload: createModel(),
    adminAuditLog: createModel(),
    benchmarkMaster: createModel(),
    emissionFactor: createModel(),
    confidenceThreshold: createModel(),
    certificationApplicability: createModel(),
    scoringWeight: createModel(),
    annualizationModifier: createModel(),
    electricityData: createModel(),
    waterData: createModel(),
    fuelData: createModel(),
    wasteData: createModel(),
    refrigerantData: createModel(),
    transportData: createModel(),
    governanceData: createModel(),
    ...overrides,
  };
}
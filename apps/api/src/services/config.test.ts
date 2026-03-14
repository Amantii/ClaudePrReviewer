import { getRepoConfig } from "./config";

jest.mock("../lib/prisma", () => ({
  prisma: {
    repoConfig: {
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require("../lib/prisma");

describe("getRepoConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when row is not found", async () => {
    (prisma.repoConfig.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getRepoConfig("owner/nonexistent");

    expect(result).toBeNull();
  });

  it("maps severity enum correctly", async () => {
    (prisma.repoConfig.findUnique as jest.Mock).mockResolvedValue({
      repoFullName: "owner/repo",
      enabled: true,
      ignorePaths: ["*.log"],
      customInstructions: null,
      minSeverity: "warning",
      installationId: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getRepoConfig("owner/repo");

    expect(result).not.toBeNull();
    expect(result!.minSeverity).toBe("warning");
  });

  it("maps null customInstructions to undefined", async () => {
    (prisma.repoConfig.findUnique as jest.Mock).mockResolvedValue({
      repoFullName: "owner/repo",
      enabled: true,
      ignorePaths: [],
      customInstructions: null,
      minSeverity: "suggestion",
      installationId: 456,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getRepoConfig("owner/repo");

    expect(result).not.toBeNull();
    expect(result!.customInstructions).toBeUndefined();
  });

  it("passes through non-null customInstructions", async () => {
    (prisma.repoConfig.findUnique as jest.Mock).mockResolvedValue({
      repoFullName: "owner/repo",
      enabled: true,
      ignorePaths: [],
      customInstructions: "Focus on performance",
      minSeverity: "suggestion",
      installationId: 789,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await getRepoConfig("owner/repo");

    expect(result!.customInstructions).toBe("Focus on performance");
  });
});

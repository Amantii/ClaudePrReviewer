import { PRReviewRequest, RepoConfig } from "@pr-reviewer/shared";

// Must add __esModule: true so ts-jest's __importDefault works correctly.
// The mockCreate is defined inside the factory so it's captured at mock-setup time.
const mockCreate = jest.fn();
jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

// Import after mock — generateReview uses the already-instantiated client
import { generateReview } from "./claude";

const mockRequest: PRReviewRequest = {
  repoFullName: "owner/repo",
  prNumber: 1,
  prTitle: "Test PR",
  prAuthor: "testuser",
  diff: "diff --git a/foo.ts b/foo.ts\n+const x = 1;",
  baseRef: "main",
  headRef: "feature",
};

const mockConfig: RepoConfig = {
  repoFullName: "owner/repo",
  enabled: true,
  ignorePaths: [],
  minSeverity: "suggestion",
};

const mockReviewResult = {
  summary: "Looks good overall",
  score: 85,
  comments: [
    {
      severity: "suggestion",
      filePath: "foo.ts",
      lineNumber: 1,
      message: "Consider using const",
    },
  ],
};

describe("generateReview", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("parses clean JSON response", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(mockReviewResult) }],
    });

    const result = await generateReview(mockRequest, mockConfig);

    expect(result.summary).toBe("Looks good overall");
    expect(result.score).toBe(85);
    expect(result.comments).toHaveLength(1);
    expect(result.generatedAt).toBeDefined();
  });

  it("strips markdown code fences from response", async () => {
    const withFences = "```json\n" + JSON.stringify(mockReviewResult) + "\n```";
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: withFences }],
    });

    const result = await generateReview(mockRequest, mockConfig);

    expect(result.summary).toBe("Looks good overall");
    expect(result.score).toBe(85);
  });

  it("appends generatedAt timestamp", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(mockReviewResult) }],
    });

    const before = new Date().toISOString();
    const result = await generateReview(mockRequest, mockConfig);
    const after = new Date().toISOString();

    expect(result.generatedAt).toBeDefined();
    expect(result.generatedAt >= before).toBe(true);
    expect(result.generatedAt <= after).toBe(true);
  });
});

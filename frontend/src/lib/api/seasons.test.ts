import { getSeasonById } from "./seasons";
import { apiRequest, createAuthHeaders } from "./client";

jest.mock("./client", () => ({
  apiRequest: jest.fn(),
  createAuthHeaders: jest.fn(() => ({ "Content-Type": "application/json" })),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockedCreateAuthHeaders = createAuthHeaders as jest.MockedFunction<typeof createAuthHeaders>;

describe("getSeasonById", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    mockedCreateAuthHeaders.mockClear();
  });

  it("encodes season id path parameters", async () => {
    mockedApiRequest.mockResolvedValue({ data: {}, meta: {} } as never);

    await getSeasonById("season/alpha?beta");

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "/v1/seasons/season%2Falpha%3Fbeta",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  });

  it("rejects empty or whitespace season ids", () => {
    expect(() => getSeasonById("")).toThrow("seasonId is required");
    expect(() => getSeasonById("   ")).toThrow("seasonId is required");
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });
});

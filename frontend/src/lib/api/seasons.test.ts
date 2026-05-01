import { getSeasonById } from "./seasons";
import { apiRequest } from "./client";

jest.mock("./client", () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("getSeasonById", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it("encodes season id path parameters", async () => {
    mockedApiRequest.mockResolvedValue({ data: {}, meta: {} } as never);

    await getSeasonById("season/alpha?beta");

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "/v1/seasons/season%2Falpha%3Fbeta",
      { method: "GET" }
    );
  });

  it("rejects empty or whitespace season ids", () => {
    expect(() => getSeasonById("")).toThrow("seasonId is required");
    expect(() => getSeasonById("   ")).toThrow("seasonId is required");
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });
});


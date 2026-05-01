import { apiRequest } from "./client";
import { getPublicProfile } from "./profile";

jest.mock("./client", () => ({
  apiRequest: jest.fn(),
  createAuthHeaders: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("getPublicProfile", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it("encodes user id path parameters", async () => {
    mockedApiRequest.mockResolvedValue({ data: {} } as never);

    await getPublicProfile("user/alpha?beta");

    expect(mockedApiRequest).toHaveBeenCalledWith(
      "/v1/users/user%2Falpha%3Fbeta/profile",
      { method: "GET" }
    );
  });

  it("rejects empty or whitespace user ids", async () => {
    await expect(getPublicProfile("")).rejects.toThrow("userId is required");
    await expect(getPublicProfile("   ")).rejects.toThrow("userId is required");
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });
});

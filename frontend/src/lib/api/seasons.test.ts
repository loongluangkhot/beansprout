import { createSeason, getSeasonById, updateSeasonSchedule } from "./seasons";
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

describe("createSeason", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    mockedCreateAuthHeaders.mockClear();
  });

  it("posts normalized payload to create season endpoint", async () => {
    mockedApiRequest.mockResolvedValue({ data: {}, meta: {} } as never);

    await createSeason(
      {
        title: "  Spring Reads  ",
        book_title: "  Tomorrow  ",
        book_author: "  Gabrielle Zevin  ",
        description: "  Warm circle  ",
        cover_image_url: "  https://example.com/c.jpg  ",
        theme: "  Contemporary Relationships  ",
        max_members: 12,
        membership_mode: "approval-required",
        location_mode: "virtual",
        location_url: "  https://meet.example.com/room-1  ",
      },
      "token-123"
    );

    expect(mockedApiRequest).toHaveBeenCalledWith("/v1/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Spring Reads",
        book_title: "Tomorrow",
        book_author: "Gabrielle Zevin",
        description: "Warm circle",
        cover_image_url: "https://example.com/c.jpg",
        theme: "Contemporary Relationships",
        max_members: 12,
        membership_mode: "approval-required",
        location_mode: "virtual",
        location_url: "https://meet.example.com/room-1",
      }),
    });
  });

  it("rejects invalid location mode combinations", () => {
    expect(() =>
      createSeason(
        {
          title: "Title",
          book_title: "Book",
          book_author: "Author",
          location_mode: "virtual",
        },
        "token-123"
      )
    ).toThrow("location_url is required when location_mode is virtual");

    expect(() =>
      createSeason(
        {
          title: "Title",
          book_title: "Book",
          book_author: "Author",
          location_mode: "in-person",
          location_url: "ftp://example.com/location",
        },
        "token-123"
      )
    ).toThrow("location_url must be a valid http(s) URL");

    expect(() =>
      createSeason(
        {
          title: "Title",
          book_title: "Book",
          book_author: "Author",
          location_mode: "hybrid" as never,
        },
        "token-123"
      )
    ).toThrow("location_mode must be virtual or in-person");
  });

  it("requires token and required fields", () => {
    expect(() =>
      createSeason(
        {
          title: "",
          book_title: "Book",
          book_author: "Author",
          location_mode: "in-person",
          location_name: "Bean & Leaf Cafe",
        },
        "token-123"
      )
    ).toThrow("title, book_title, and book_author are required");

    expect(() =>
      createSeason(
        {
          title: "Title",
          book_title: "Book",
          book_author: "Author",
          location_mode: "in-person",
          location_name: "Bean & Leaf Cafe",
        },
        ""
      )
    ).toThrow("token is required");
  });
});

describe("updateSeasonSchedule", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
    mockedCreateAuthHeaders.mockClear();
  });

  it("uses patch endpoint with auth header", async () => {
    mockedApiRequest.mockResolvedValue({ data: {}, meta: {} } as never);

    await updateSeasonSchedule(
      "season/alpha",
      {
        start_date: "2026-12-01T10:00:00.000Z",
        duration_weeks: 10,
        frequency: "bi-weekly",
        meetup_datetimes: ["2026-12-01T10:00:00.000Z"],
      },
      "token-123"
    );

    expect(mockedApiRequest).toHaveBeenCalledWith("/v1/seasons/season%2Falpha/schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: "2026-12-01T10:00:00.000Z",
        duration_weeks: 10,
        frequency: "bi-weekly",
        meetup_datetimes: ["2026-12-01T10:00:00.000Z"],
      }),
    });
  });

  it("requires season id and token", () => {
    expect(() =>
      updateSeasonSchedule(
        "",
        {
          start_date: "2026-12-01T10:00:00.000Z",
          duration_weeks: 10,
          frequency: "weekly",
        },
        "token"
      )
    ).toThrow("seasonId is required");

    expect(() =>
      updateSeasonSchedule(
        "season-1",
        {
          start_date: "2026-12-01T10:00:00.000Z",
          duration_weeks: 10,
          frequency: "weekly",
        },
        ""
      )
    ).toThrow("token is required");
  });
});

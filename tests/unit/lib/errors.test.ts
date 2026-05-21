import { AppError, ERROR_MESSAGES, handleActionError } from "@/lib/errors";

describe("error helpers", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("maps AppError instances to structured responses", () => {
    const error = new AppError("No hospital", 404, "NOT_FOUND");

    expect(handleActionError(error)).toEqual({
      error: "No hospital",
      code: "NOT_FOUND",
    });
  });

  test("falls back to internal server error for unknown exceptions", () => {
    expect(handleActionError(new Error("boom"))).toEqual({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_ERROR",
    });
  });
});
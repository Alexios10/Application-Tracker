import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("returns the message from an Error", () => {
    expect(getErrorMessage(new Error("Noe gikk galt"))).toBe("Noe gikk galt");
  });

  it("falls back to the default text when the error is not an Error", () => {
    expect(getErrorMessage("bare en streng")).toBe("Ukjent feil");
  });

  it("falls back to the default text when the Error has no message", () => {
    expect(getErrorMessage(new Error(""))).toBe("Ukjent feil");
  });

  it("accepts a custom fallback text", () => {
    expect(getErrorMessage(null, "Kunne ikke lagre")).toBe("Kunne ikke lagre");
  });
});

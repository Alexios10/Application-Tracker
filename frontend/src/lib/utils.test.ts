import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./utils";

describe("getErrorMessage", () => {
  it("returnerer meldingen fra en Error", () => {
    expect(getErrorMessage(new Error("Noe gikk galt"))).toBe("Noe gikk galt");
  });

  it("bruker standardtekst når feilen ikke er en Error", () => {
    expect(getErrorMessage("bare en streng")).toBe("Ukjent feil");
  });

  it("bruker standardtekst når Error mangler melding", () => {
    expect(getErrorMessage(new Error(""))).toBe("Ukjent feil");
  });

  it("kan få egen standardtekst", () => {
    expect(getErrorMessage(null, "Kunne ikke lagre")).toBe("Kunne ikke lagre");
  });
});

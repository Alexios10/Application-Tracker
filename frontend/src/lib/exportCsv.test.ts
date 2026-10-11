import { describe, it, expect } from "vitest";
import { toCsv } from "./exportCsv";
import { Application } from "@/types/application";

const app = (overrides: Partial<Application>): Application => ({
  id: 1,
  company: "Equinor",
  position: "Utvikler",
  dateSent: "01.10.26",
  status: "Sendt",
  ...overrides,
});

describe("toCsv", () => {
  it("starts with a BOM and a header row separated by semicolons", () => {
    const csv = toCsv([]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe(
      "Bedrift;Stilling;Sendt;Status;Søknadsfrist;Lenke;Notat",
    );
  });

  it("puts the newest application first", () => {
    const csv = toCsv([
      app({ id: 1, company: "Gammel AS", dateSent: "01.01.26" }),
      app({ id: 2, company: "Ny AS", dateSent: "01.10.26" }),
    ]);
    const rows = csv.split("\r\n");
    expect(rows[1].startsWith("Ny AS;")).toBe(true);
    expect(rows[2].startsWith("Gammel AS;")).toBe(true);
  });

  it("quotes values with semicolons, quotes or line breaks", () => {
    const csv = toCsv([
      app({ company: 'Firma "AS"', note: "Linje 1\nLinje 2; mer" }),
    ]);
    const row = csv.split("\r\n").slice(1).join("\r\n");
    expect(row).toContain('"Firma ""AS"""');
    expect(row).toContain('"Linje 1\nLinje 2; mer"');
  });

  it("leaves empty optional fields empty", () => {
    const csv = toCsv([app({})]);
    expect(csv.split("\r\n")[1]).toBe("Equinor;Utvikler;01.10.26;Sendt;;;");
  });
});

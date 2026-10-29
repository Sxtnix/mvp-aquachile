import { describe, expect, it } from "vitest";
import {
  aFecha,
  diasEntre,
  esFutura,
  esISOValida,
  esPosterior,
  formatFecha,
  hoyISO,
} from "./fechas.js";

describe("hoyISO", () => {
  it("devuelve la fecha de hoy en formato AAAA-MM-DD", () => {
    expect(hoyISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("esISOValida", () => {
  it("acepta fechas ISO válidas", () => {
    expect(esISOValida("2026-10-01")).toBe(true);
  });

  it("rechaza formatos incorrectos o inexistentes", () => {
    expect(esISOValida("01-10-2026")).toBe(false);
    expect(esISOValida("2026-13-01")).toBe(false);
    expect(esISOValida("")).toBe(false);
  });
});

describe("esPosterior y esFutura", () => {
  it("detecta fechas posteriores", () => {
    expect(esPosterior("2026-10-05", "2026-10-01")).toBe(true);
    expect(esPosterior("2026-10-01", "2026-10-05")).toBe(false);
    expect(esPosterior("2026-10-01", "2026-10-01")).toBe(false);
  });

  it("detecta fechas futuras respecto a hoy", () => {
    expect(esFutura("2999-01-01")).toBe(true);
    expect(esFutura("2000-01-01")).toBe(false);
  });
});

describe("diasEntre", () => {
  it("calcula la diferencia en días entre dos fechas", () => {
    expect(diasEntre("2026-10-01", "2026-10-05")).toBe(4);
  });

  it("devuelve null si alguna fecha es inválida", () => {
    expect(diasEntre("2026-10-01", "mala")).toBeNull();
    expect(diasEntre("", "2026-10-05")).toBeNull();
  });
});

describe("formatFecha", () => {
  it("formatea una fecha ISO válida", () => {
    expect(formatFecha("2026-10-01")).toContain("2026");
  });

  it("devuelve un guion para fechas inválidas", () => {
    expect(formatFecha("")).toBe("—");
  });
});

describe("aFecha", () => {
  it("convierte una fecha ISO a objeto Date", () => {
    expect(aFecha("2026-10-01")).toBeInstanceOf(Date);
  });

  it("devuelve null para entradas inválidas", () => {
    expect(aFecha("no-fecha")).toBeNull();
    expect(aFecha("")).toBeNull();
  });
});

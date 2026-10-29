export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function aFecha(iso) {
  if (!iso) return null;
  const fecha = new Date(`${iso}T00:00:00`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function esISOValida(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return aFecha(iso) !== null;
}

export function esPosterior(a, b) {
  const fechaA = aFecha(a);
  const fechaB = aFecha(b);
  if (!fechaA || !fechaB) return false;
  return fechaA.getTime() > fechaB.getTime();
}

export function esFutura(iso) {
  return esPosterior(iso, hoyISO());
}

export function diasEntre(desde, hasta) {
  const fechaDesde = aFecha(desde);
  const fechaHasta = aFecha(hasta);
  if (!fechaDesde || !fechaHasta) return null;
  const ms = fechaHasta.getTime() - fechaDesde.getTime();
  return Math.round(ms / 86400000);
}

export function formatFecha(iso) {
  const fecha = aFecha(iso);
  if (!fecha) return "—";
  return fecha.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BadgeEstado({ estado }) {
  const clases = {
    Pendiente: "text-bg-secondary",
    "En proceso": "text-bg-warning",
    Finalizada: "text-bg-success",
  };

  return (
    <span className={`badge ${clases[estado] || "text-bg-secondary"}`}>
      {estado}
    </span>
  );
}

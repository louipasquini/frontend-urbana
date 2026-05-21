export default function Alert({ type = "error", children }) {
  const styles =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <p className={`text-sm md:text-base border rounded-2xl px-4 py-3 mb-4 ${styles}`}>
      {children}
    </p>
  );
}

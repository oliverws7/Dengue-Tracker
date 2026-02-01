import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="absolute top-4 right-4 text-sm px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700"
    >
      {dark ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}

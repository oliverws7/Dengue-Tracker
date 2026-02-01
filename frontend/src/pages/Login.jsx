import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import illustration from "../assets/login-illustration.svg";
import ThemeToggle from "../components/ThemeToggle";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900 transition-colors">
      <ThemeToggle />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white dark:bg-zinc-800 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      >
        {/* LADO ESQUERDO */}
        <div className="hidden md:flex items-center justify-center bg-emerald-900 p-8">
          <img src={illustration} alt="Login" className="max-w-sm" />
        </div>

        {/* LADO DIREITO */}
        <div className="p-10">
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
            Login
          </h1>
          <p className="text-zinc-500 mb-6">
            Bem-vindo de volta 👋
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email")}
                placeholder="Seu e-mail"
                className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white outline-none"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register("password")}
                placeholder="Sua senha"
                className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white outline-none"
              />
              {errors.password && (
                <span className="text-red-500 text-sm">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="text-right text-sm">
              <a href="#" className="text-emerald-600 hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 transition rounded-lg text-white font-semibold"
            >
              Entrar no sistema
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Novo por aqui?{" "}
            <a href="#" className="text-emerald-600 font-semibold">
              Crie sua conta
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 food-pattern-bg">
      <div className="w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

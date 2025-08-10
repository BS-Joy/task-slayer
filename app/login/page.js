import logo from "@/public/logo.png";

import { LoginForm } from "@/components/login/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center mt-24">
      <div className="w-full max-w-xs">
        <LoginForm />
      </div>
    </div>
  );
}

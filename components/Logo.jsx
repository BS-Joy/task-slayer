import Image from "next/image";
import Link from "next/link";
import React from "react";
import logoImage from "@/public/logo.png";

const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <Link href="/" className="font-bold text-xl flex gap-2 font-trajan-pro">
        Task
        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Image src={logoImage} alt="logo" />
        </div>
        Slayer
      </Link>
    </div>
  );
};

export default Logo;

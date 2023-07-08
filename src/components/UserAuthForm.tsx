"use client";

import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "./ui/Button";
import { Icons } from "./Icons";

type UserAuthFormProps = {
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const UserAuthForm: React.FC<UserAuthFormProps> = ({
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      await signIn("google");
    } catch (error) {
      //toast
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        size="sm"
        className="w-full"
        isLoading={isLoading}
        onClick={loginWithGoogle}
      >
        {isLoading ? null : <Icons.google className="h-w mr-2 w-4" />}
        Google
      </Button>
    </div>
  );
};

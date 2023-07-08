"use client";

import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "./ui/Button";
import { Icons } from "./Icons";
import { toast } from "@/hooks/use-toast";

type UserAuthFormProps = {
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const UserAuthForm: React.FC<UserAuthFormProps> = ({
  className,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  async function login(provider: "google" | "discord") {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
      toast({
        title: "There was an ERROR",
        description: "Something error logging in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn("flex flex-col justify-center gap-2", className)}
      {...props}
    >
      <Button
        size="sm"
        className="w-full"
        isLoading={isLoading}
        onClick={() => login("google")}
      >
        {isLoading ? null : <Icons.google className="h-w mr-2 w-4" />}
        Google
      </Button>
      <Button
        size="sm"
        className="w-full"
        isLoading={isLoading}
        onClick={() => login("discord")}
      >
        {isLoading ? null : <Icons.discord className="h-w mr-2 w-4" />}
        Discord
      </Button>
    </div>
  );
};

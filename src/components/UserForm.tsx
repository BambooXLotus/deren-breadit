"use client";

import { toast } from "@/hooks/use-toast";
import { UserRequest, UserValidator } from "@/lib/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

type UserFormProps = {
  user: Pick<User, "id" | "username">;
};

export const UserForm: React.FC<UserFormProps> = ({ user }) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserRequest>({
    resolver: zodResolver(UserValidator),
    defaultValues: {
      name: user.username || "",
    },
  });

  const { mutate: updateUser, isLoading } = useMutation({
    mutationFn: async ({ name }: UserRequest) => {
      const payload: UserRequest = { name };

      const { data } = await axios.patch(`/api/user/`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please choose another username.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong.",
        description: "Your user was not updated. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Your username has been updated.",
      });
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((e) => updateUser(e))}>
      <Card>
        <CardHeader>
          <CardTitle>User</CardTitle>
          <CardDescription>
            Please enter user information mangy!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            ></Input>

            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Save</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

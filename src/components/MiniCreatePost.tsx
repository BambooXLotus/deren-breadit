"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Image as ImageIcon, Link2 } from "lucide-react";
import { FC } from "react";
import { UserAvatar } from "./UserAvatar";
import type { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";

type MiniCreatePostProps = {
  session: Session | null;
};

export const MiniCreatePost: FC<MiniCreatePostProps> = ({ session }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 flex justify-between gap-6">
        <div className="">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />
        </div>
        <Input
          onClick={() => router.push(pathname + "/submit")}
          readOnly
          placeholder="Create post"
        />
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};

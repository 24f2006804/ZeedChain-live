import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shared/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { IconWallet } from "@tabler/icons-react";
import { Button } from "./ui/button";

export interface UserDetails {
  name: string;
  image: string;
  username: string;
}

const ProfileCard = ({ user }: { user: UserDetails }) => {
    const isWalletConnected = false;
    const connectWalletAction = () => {
        console.log("connect wallet");
    };
  return (
    <Card className="">
      <CardContent className="flex flex-col p-2">
        <div className="flex gap-2 items-center p-5 ">
            <Avatar>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="username flex flex-col gap-1">
              <h1 className="text-lg font-semibold">{user.name}</h1>
              <h2 className="text-sm font-medium leading-none text-muted-foreground">
                @{user.username}
              </h2>
            </div>
        </div>
        <div className="ml-3 flex flex-row gap-2">
            <Badge variant="outline">Verified</Badge>
            <Badge variant="outline">Investor</Badge>
        </div>
        { isWalletConnected ? 
        (        <div className="rounded-full border border-neutral-600 mx-3 my-4 p-2 flex gap-2">
            <IconWallet className="text-muted"></IconWallet>Oxeid7s89ad7a
        </div>) : (<Button variant={"default"} onClick={connectWalletAction} className="mx-3 my-4 bg-neutral-300">Connect Wallet</Button>
        )
    }
      </CardContent>
    </Card>
  );
};

export default ProfileCard;

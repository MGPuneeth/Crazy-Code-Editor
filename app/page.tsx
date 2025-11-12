import Image from "next/image";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import dotenv from "dotenv";
import UserButton from "@/modules/auth/components/user-button";

dotenv.config();

export default async function Home() {
  // const user =  db.user.
  console.log("Database: ", process.env.DATABASE_URL);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Button> Get Started</Button>
      <UserButton />
    </div>
  );
}

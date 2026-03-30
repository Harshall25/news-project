"use client"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"


export default function NavBar() {
    
    const { data: session, status } = useSession();
    const router = useRouter();
    return (
        <div className="navbar bg-base-100 shadow-sm flex min-h-15  justify-center items-center">
            <div className="flex-2 ml-8">
                <a className="btn btn-ghost text-xl cursor-pointer ">News App</a>
            </div>
            <div className="flex mr-4">
                <ul className="menu menu-horizontal px-1 flex justify-center items-center gap-4">
                    <li><h1>Welcome, {session?.user?.name}</h1></li>
                    <li>
                        <Button variant="destructive" onClick={() => signOut()} className="cursor-pointer">Logout</Button>
                    </li>
                </ul>
            </div>
        </div>
    )
}

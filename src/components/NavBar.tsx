"use client"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NavBar() {

    const { data: session, status } = useSession();
    const router = useRouter();
    return (
        <div className="navbar bg-base-100 shadow-sm flex min-h-18 items-center">

            {/* Left */}
            <div className="flex-1 flex justify-start pl-6">
                <a
                    className="btn btn-ghost text-xl cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    News App
                </a>
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center">
                <Tabs defaultValue="overview">
                    <TabsList variant="line">
                        
                        <TabsTrigger 
                            value="technology" 
                            onClick={() => router.push('/?category=technology')}
                        >
                            Technology
                        </TabsTrigger>
                        <TabsTrigger 
                            value="entertainment" 
                            onClick={() => router.push('/?category=entertainment')}
                        >
                            Entertainment
                        </TabsTrigger>
                        <TabsTrigger 
                            value="lifestyle" 
                            onClick={() => router.push('/?category=lifestyle')}
                        >
                            Lifestyle
                        </TabsTrigger>
                        <TabsTrigger 
                            value="travel" 
                            onClick={() => router.push('/?category=travel')}
                        >
                            Travel
                        </TabsTrigger>
                        <TabsTrigger 
                            value="education" 
                            onClick={() => router.push('/?category=education')}
                        >
                            Education
                        </TabsTrigger>
                        <TabsTrigger 
                            value="politics" 
                            onClick={() => router.push('/?category=politics')}
                        >
                            Politics
                        </TabsTrigger>
                        <TabsTrigger 
                            value="sports" 
                            onClick={() => router.push('/?category=sports')}
                        >
                            Sports
                        </TabsTrigger>
                        <TabsTrigger 
                            value="business" 
                            onClick={() => router.push('/?category=business')}
                        >
                            Business
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Right */}
            <div className="flex-1 flex justify-end pr-6">
                <ul className="menu menu-horizontal flex items-center gap-4">
                    <li>Welcome, {session?.user?.name}</li>
                    <li>
                        <Button variant="destructive" onClick={() => signOut()}>
                            Logout
                        </Button>
                    </li>
                </ul>
            </div>
        </div>
    )
}
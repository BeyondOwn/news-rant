'use client'
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Login (){

    const GoogleAuth = async () =>{
        window.location.href = "http://localhost:5000/auth/google";
    }

    return (
        <div className="flex w-[100%] min-h-screen justify-center">
            <Button onClick={GoogleAuth} className="w-60 font-bold place-self-center">
            <Image width={32} height={32} alt="google" src="google.svg"/> Login with Google
            </Button>
        </div>
    )
}
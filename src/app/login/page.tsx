'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useEffect, useState } from "react";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: () => void;
                    renderButton: (parent: HTMLElement, options: any) => void;
                }
            }
        }
    }
}

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            // Initialize Google Identity Services
            window.google?.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: (response) => {
                    // Redirect to your backend auth endpoint
                    window.location.href = "http://localhost:5000/auth/google";
                },
                ux_mode: 'popup',
            });

            // Trigger the prompt
            window.google?.accounts.id.prompt();

        } catch (error) {
            console.error('Error initializing Google One Tap:', error);
        }
    }, []);

    const GoogleAuth = async () => {
        window.location.href = "http://localhost:5000/auth/google";
    }

    return (
        <div className="flex w-full min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-card rounded-lg p-6 relative -mt-40">
               
                
                {/* Header */}
                <h1 className="text-2xl font-bold text-center mb-8">Log in or sign up</h1>
                
                {/* Google login button */}
                <Button 
                    onClick={GoogleAuth} 
                    variant="outline" 
                    className="w-full mb-4 flex items-center gap-3 h-12 hover:text-secondary-foreground"
                >
                    <Image width={20} height={20} alt="google" src="google.svg"/>
                    <span>Continue with Google</span>
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">OR</span>
                    </div>
                </div>

                {/* Email input */}
                <div className="space-y-4">
                    <Input 
                        type="email" 
                        placeholder="Email address" 
                        className="h-12"
                    />
                    <Button className="w-full h-12">
                        Continue with email
                    </Button>
                </div>

                {/* Terms and conditions */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    By continuing, you acknowledge that you have read, understood, and agree to our{' '}
                    <a href="#" className="underline hover:text-foreground">Terms & Conditions</a>
                    {' '}and{' '}
                    <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
                </p>
            </div>
        </div>
    )
}
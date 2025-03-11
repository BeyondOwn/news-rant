'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/context";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
    const { setAuthData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [oneTapError, setOneTapError] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);
    const hasCheckedParams = useRef(false);

    useEffect(() => {
        if (isInitialized || isPrompting) return;
        
        const initializeGoogleOneTap = async () => {
            try {
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                if (!clientId) {
                    console.error('Google Client ID is not configured');
                    setOneTapError(true);
                    return;
                }

                setIsPrompting(true);
                window.google?.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        try {
                            setIsLoading(true);
                            window.location.href = `https://scraping-api-w0za.onrender.com/auth/google?credential=${response.credential}`;
                        } catch (error) {
                            console.error('Authentication error:', error);
                            setOneTapError(true);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    ux_mode: 'popup',
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                await new Promise(resolve => setTimeout(resolve, 1000));

                window.google?.accounts.id.prompt();

            } catch (error) {
                console.error('Error initializing Google One Tap:', error);
                setOneTapError(true);
            } finally {
                setIsInitialized(true);
                setIsPrompting(false);
            }
        };

        initializeGoogleOneTap();
    }, [isInitialized, isPrompting]);

    const GoogleAuth = () => {
        window.location.href = `https://scraping-api-w0za.onrender.com/auth/google`;
    }

    // Second useEffect for handling redirect
    useEffect(() => {
        if (hasCheckedParams.current) return;
        hasCheckedParams.current = true;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userData = params.get('userData');
        
        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                if (user && token) {
                    setAuthData(token, user);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [setAuthData]);

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
                    disabled={isLoading}
                >
                    <Image width={20} height={20} alt="google" src="google.svg"/>
                    <span>Continue with Google</span>
                </Button>

                {/* Show message if One Tap fails */}
                {oneTapError && (
                    <p className="text-sm text-muted-foreground text-center mb-4">
                        One-tap sign in not available. Please use the button above.
                    </p>
                )}

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
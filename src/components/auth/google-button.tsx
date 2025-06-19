'use client'

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleAuthHelper } from '@/lib/google-auth';
import { useAuthStore } from '@/stores/auth-store';

interface GoogleButtonProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function GoogleButton({ mode, onSuccess, onError }: GoogleButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const {signinWithGoogle, signupWithGoogle} = useAuthStore();

    // Handle custom button click
    const handleCustomButtonClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const googleAuth = GoogleAuthHelper.getInstance();
            const credential = await googleAuth.signInWithGoogle();

            if (mode === 'signin') {
                await signinWithGoogle(credential);
            } else {
                await signupWithGoogle(credential);
            }

            onSuccess?.();
        } catch (error) {
            console.error(`Google ${mode} failed:`, error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    };
    // Try to use Google's Render button if possible
    useEffect(() => {
        if (buttonRef.current && window.google && window.google.accounts) {
            try {
                const googleAuth = GoogleAuthHelper.getInstance();
                googleAuth.renderGoogleButton('google-signin-button')
                  .then(async (credential) => {
                    setIsLoading(true);
                    try {
                        if (mode == 'signin') {
                            await signinWithGoogle(credential);
                        } else {
                            await signupWithGoogle(credential);
                        }
                        onSuccess?.();
                    } catch (error) {
                        console.error(`Google ${mode} failed:`, error);
                        onError?.(error as Error);
                    } finally {
                        setIsLoading(false);
                    }
                  })
                  .catch((error) => {
                    console.warn("Failed to render Google button, using fallback:", error);
                    // If rendering fails, we'll use our custom button
                  });
            } catch (error) {
                console.warn("Error initializing Google button:", error);
            }
        }
    }, [mode, signinWithGoogle, signupWithGoogle, onError, onSuccess]);

    return (
        <>
            {/* Hidden div for Google's rendered button */}
            <div
              id="google-signin-button"
              ref={buttonRef}
              style={{ display: 'none' }}
            ></div>

            {/* Custom button as fallback */}
            <Button
              type="button"
              onClick={handleCustomButtonClick}
              variant="outline"
              className="w-full border-slate-300 dark:border-slate-600"
              disabled={isLoading}
            >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                </svg>
                Continue with Google
            </Button>
        </>
    )};
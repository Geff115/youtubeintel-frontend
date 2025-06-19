import { error } from 'console';
import { GoogleAuth } from 'google-auth-library';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  verified_email: boolean;
}

export class GoogleAuthHelper {
  private static instance: GoogleAuthHelper;
  private clientId: string;

  private constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!this.clientId) {
      throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined!');
    }
    this.loadGoogleScript();
  }

  public static getInstance(): GoogleAuthHelper {
    if (!GoogleAuthHelper.instance) {
      GoogleAuthHelper.instance = new GoogleAuthHelper();
    }
    return GoogleAuthHelper.instance;
  }

  private initializeGoogleAuth() {
    if (typeof window !== 'undefined') {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  private loadGoogleScript(): void {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  // Wait for Google script to load
  private async waitForGoogleLoad(): Promise<void> {
    return new Promise((resolve) => { const checkLoaded = () => {
      if (window.google && window.google.accounts) {
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    checkLoaded();
    });
  }

  // Use Google One Tap API for sign-in
  public async signInWithGoogle(): Promise<string> {
    try {
      await this.waitForGoogleLoad();

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            if (response && response.credential) {
              console.log("Got credential from Google");
              resolve(response.credential);
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger the one-tap UI
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn("Google One Tap not displayed:", notification.getNotDisplayedReason());
            // Fall back to a different method if One Tap is not displayed
            this.signInWithGoogleRedirect()
              .then(resolve)
              .catch(reject);
          } else if (notification.isSkippedMoment()) {
            console.warn("Google One Tap skipped:", notification.getSkippedReason());
            // Fall back if skipped
            this.signInWithGoogleRedirect()
              .then(resolve)
              .catch(reject);
          } else if (notification.isDismissedMoment()) {
            console.warn("Google One Tap dismissed:", notification.getDismissedReason());
            reject(new Error('Google sign-in was dismissed'));
          }
        });
      });
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      throw error;
    }
  }

  // Alternative method using a button click
  public renderGoogleButton(elementId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.waitForGoogleLoad();
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => {
            if (response && response.credential) {
              resolve(response.credential);
            } else {
              reject(new Error('No credential received from Google'));
            }
          },
        });

        // Render the button
        const element = document.getElementById(elementId);
        if (element) {
          window.google.accounts.id.renderButton(element, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: element.offsetWidth,
          });
        } else {
          reject(new Error(`Element with ID ${elementId} not found`));
        }
      } catch (error) {
        console.error("Error rendering Google button:", error);
        reject(error);
      }
    });
  }

  // Fallback to redirect flow if other methods fail
  private async signInWithGoogleRedirect(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initCodeClient({
          clientId: this.clientId,
          scope: 'openid email profile',
          ux_mode: 'redirect',
          redirect_uri: `${window.location.origin}/auth/callback`,
          state: JSON.stringify({ returnTo: window.location.pathname }),
          callback: (response: any) => {
            // This won't be called with redirect flow
            if (response && response.code) {
              resolve(response.code);
            } else {
              reject(new Error('No code received'));
            }
          },
        });
        client.requestCode();
      } catch (error) {
        console.error("Error in signInWithGoogleRedirect:", error);
        reject(error);
      }
    });
  }

  // Parse JWT token to get user info
  public static parseGoogleUser(idToken: string): GoogleUser {
    try {
      // For JWT tokens, decode the payload
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
        verified_email: payload.email_verified || false,
      };
    } catch (error) {
      console.error("Error parsing Google user:", error);
      throw new Error('Invalid Google ID token format');
    }
  }

  public async initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Sign-In is only available in the browser'));
        return;
      }

      const checkGoogleLoaded = () => {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: () => {}, // Will be set by individual components
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          resolve();
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };

      checkGoogleLoaded();
    });
  }

  // FedCM compatible approach for Google Sign-In
  public async signInWithPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Sign-In is only available in the browser'));
        return;
      }

      // Make sur Google library is loaded
      const checkGoogleLoaded = () => {
        if (window.google && window.google.accounts) {
          this.configureGoogleAuth(resolve, reject);
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };
      checkGoogleLoaded();
    });
  }

  private configureGoogleAuth(resolve: (value: string) => void, reject: (reason: any) => void): void {
    try {
      // Use Google Identity Services OAuth2 flow
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        redirect_uri: `${window.location.origin}/auth/callback`,
        callback: (response: any) => {
          if (response.code) {
            // Exchange the code for tokens
            this.exchangeCodeForToken(response.code)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error('No authorization code received from Google'));
          }
        },
        error_callback: (error: any) => {
          reject(new Error(`Google authentication error: ${error.message || 'Unknown error'}`));
        },
        // FedCM specific settings
        use_fedcm_for_prompt: true  // Opt in to FedCM
      });
      // Launch the flow
      client.requestAccessToken();
    } catch (error) {
      console.error('Error configuring Google Auth:', error);
      reject(error);
    }
  }

  private async exchangeCodeForToken(code: string): Promise<string> {
    try {
      // This should call the backend endpoint that exchanges the code for tokens
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include', // Ensure cookies are sent
      });

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      const data = await response.json();
      return data.id_token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
}

// Global types for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: any) => void;
          renderButton: (element: Element, config: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initCodeClient: (config: any) => { requestCode: () => void };
          initTokenClient: (config: any) => { requestAccessToken: () => void };
        };
      };
    };
  }
}
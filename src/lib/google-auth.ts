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
  private client?: GoogleAuth;

  private constructor() {
    this.initializeGoogleAuth();
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

  private initialized = false;

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

  public async signInWithPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google) {
        reject(new Error('Google Sign-In not available'));
        return;
      }

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup if prompt is not shown
          this.showPopup().then(resolve).catch(reject);
        }
      });

      // Set up the callback for credential response
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response: any) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('No credential received'));
          }
        },
      });
    });
  }

  private async showPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.google) {
        reject(new Error('Google Sign-In not available'));
        return;
      }

      // Use the newer Google Identity Services popup
      window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'openid email profile',
        callback: (response: any) => {
          if (response.access_token) {
            // Convert access token to ID token by calling Google's userinfo endpoint
            this.getIdTokenFromAccessToken(response.access_token)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error('No access token received'));
          }
        },
      }).requestAccessToken();
    });
  }

  private async getIdTokenFromAccessToken(accessToken: string): Promise<string> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
      const userInfo = await response.json();
      
      // Create a pseudo ID token with user info
      // Note: In production, you might want to get a proper ID token
      // For now, we'll pass the user info directly to your backend
      return JSON.stringify(userInfo);
    } catch (error) {
      throw new Error('Failed to get user info from Google');
    }
  }

  public static parseGoogleUser(credentialOrUserInfo: string): GoogleUser {
    try {
      // Try to parse as JSON first (from our pseudo token)
      const userInfo = JSON.parse(credentialOrUserInfo);
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        given_name: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
        family_name: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
        picture: userInfo.picture,
        verified_email: userInfo.verified_email ?? true,
      };
    } catch {
      // If not JSON, try to decode as JWT
      try {
        const payload = JSON.parse(atob(credentialOrUserInfo.split('.')[1]));
        return {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          given_name: payload.given_name,
          family_name: payload.family_name,
          picture: payload.picture,
          verified_email: payload.email_verified,
        };
      } catch {
        throw new Error('Invalid Google credential format');
      }
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
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}
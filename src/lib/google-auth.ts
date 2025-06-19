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
  private authWindow: Window | null = null;

  private constructor() {}

  public static getInstance(): GoogleAuthHelper {
    if (!GoogleAuthHelper.instance) {
      GoogleAuthHelper.instance = new GoogleAuthHelper();
    }
    return GoogleAuthHelper.instance;
  }

  public async initializeGoogleSignIn(): Promise<void> {
    // No initialization needed for standard OAuth flow
    return Promise.resolve();
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  public async signInWithPopup(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
    }

    // Generate nonce for security
    const nonce = this.generateNonce();
    sessionStorage.setItem('google_auth_nonce', nonce);

    // Build the Google OAuth2 URL for implicit flow to get ID token directly
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'id_token token',
      scope: 'openid email profile',
      nonce: nonce,
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Open popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    this.authWindow = window.open(
      authUrl,
      'google-signin',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!this.authWindow) {
      throw new Error('Failed to open popup window. Please check your popup blocker settings.');
    }

    // Return a promise that resolves when we receive the ID token
    return new Promise((resolve, reject) => {
      // Set up message listener for the callback
      const messageHandler = async (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'google-auth-success') {
          window.removeEventListener('message', messageHandler);
          
          try {
            // Verify nonce
            const savedNonce = sessionStorage.getItem('google_auth_nonce');
            const tokenPayload = this.parseJWT(event.data.idToken);
            
            if (tokenPayload.nonce !== savedNonce) {
              throw new Error('Invalid nonce');
            }
            
            // Clean up
            sessionStorage.removeItem('google_auth_nonce');
            
            resolve(event.data.idToken);
            
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'google-auth-error') {
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed
      const checkPopup = setInterval(() => {
        if (this.authWindow && this.authWindow.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication cancelled by user'));
        }
      }, 1000);
    });
  }

  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  public static parseGoogleUser(idToken: string): GoogleUser {
    try {
      // Decode JWT ID token from Google
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
        verified_email: payload.email_verified || false,
      };
    } catch (error) {
      throw new Error('Failed to parse Google ID token');
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
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
          storeCredential?: (credential: any) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}
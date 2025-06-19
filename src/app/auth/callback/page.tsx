'use client';

import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    // This will close the popup window after successful authentication
    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Authentication Successful</h1>
        <p>You can close this window and return to the application.</p>
      </div>
    </div>
  );
}
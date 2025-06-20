'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [clientInfo, setClientInfo] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Get all client-side info
    const info = {
      // URL and routing
      currentURL: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      host: window.location.host,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      
      // Cookies
      cookies: document.cookie,
      
      // User agent
      userAgent: navigator.userAgent,
      
      // Local storage (if any)
      localStorage: (() => {
        try {
          const storage: Record<string, string | null> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) storage[key] = localStorage.getItem(key);
          }
          return storage;
        } catch {
          return 'Not available';
        }
      })(),
      
      // Session storage (if any)
      sessionStorage: (() => {
        try {
          const storage: Record<string, string | null> = {};
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) storage[key] = sessionStorage.getItem(key);
          }
          return storage;
        } catch {
          return 'Not available';
        }
      })(),
      
      // Browser info
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      
      // Screen info
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Timing
      timestamp: new Date().toISOString(),
      timezoneOffset: new Date().getTimezoneOffset(),
    };
    
    setClientInfo(info);
  }, []);

  // Server-side environment variables (only safe ones will show)
  const serverEnv = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_REGION: process.env.VERCEL_REGION,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  };

  const renderObject = (obj: unknown, title: string) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-8">🚨 DEBUG DUMP - EVERYTHING EXPOSED 🚨</h1>
        
        {renderObject(serverEnv, "Server Environment Variables")}
        {renderObject(clientInfo, "Client Information")}
        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Process Environment (Server-side)</h2>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(process.env, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Routes Test</h2>
          <div className="grid gap-2">
            {[
              '/test',
              '/debug', 
              '/candidate',
              '/profile/test-id',
              '/business/candidate/test-id'
            ].map(route => (
              <div key={route} className="p-2 border rounded">
                <a href={route} className="text-blue-600 hover:underline font-mono">
                  {route}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-8">
          Generated at: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}
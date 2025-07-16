'use client';

import { getToken, removeToken } from '@/services/tokenService';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  const handleLogout = () => {
    removeToken();
    setToken(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline text-center">
        Hello world!
      </h1>
      {token ? (
        <div>
          <p>Welcome!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <Link href="/login">Login</Link>
          <br />
          <Link href="/register">Register</Link>
        </div>
      )}
    </div>
  );
}
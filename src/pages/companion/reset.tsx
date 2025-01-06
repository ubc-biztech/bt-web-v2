import React, { useEffect, useState } from 'react';
import { COMPANION_EMAIL_KEY } from '@/constants/companion';

export default function ResetCompanion() {
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    localStorage.removeItem(COMPANION_EMAIL_KEY);
    setIsReset(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center p-8 rounded-lg border border-white/10 backdrop-blur-xl bg-black/60">
        <h1 className="text-2xl mb-4">Companion Reset</h1>
        {isReset ? (
          <p>Your companion data has been reset successfully.</p>
        ) : (
          <p>Resetting companion data...</p>
        )}
      </div>
    </div>
  );
} 
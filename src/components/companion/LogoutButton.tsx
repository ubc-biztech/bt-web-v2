import { useRouter } from 'next/router';
import { COMPANION_EMAIL_KEY, COMPANION_PROFILE_ID_KEY } from '@/constants/companion';
import { deleteCookie } from 'cookies-next';

const COMPANION_FNAME_KEY = 'companion_fname';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all companion cookies
    deleteCookie(COMPANION_EMAIL_KEY);
    deleteCookie(COMPANION_FNAME_KEY);
    deleteCookie(COMPANION_PROFILE_ID_KEY);
    
    router.push('/companion');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white hover:text-gray-300 transition-colors"
    >
      Logout
    </button>
  );
} 
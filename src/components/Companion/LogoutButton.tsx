import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem(COMPANION_EMAIL_KEY);
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="absolute top-2 right-2"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;

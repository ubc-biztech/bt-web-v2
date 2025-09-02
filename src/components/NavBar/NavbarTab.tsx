import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "@aws-amplify/auth";

interface NavbarItem {
  title: string;
  link: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavbarProps {
  navbarItem: NavbarItem;
  onLogout?: () => void;
  onTabClick?: () => void;
}

const NavbarTab: React.FC<NavbarProps> = ({
  navbarItem,
  onLogout,
  onTabClick,
}) => {
  const router = useRouter();
  const isSelected = navbarItem.link && router.pathname === navbarItem.link;
  const isLogout = navbarItem.title.toLowerCase() === "logout";
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const baseClasses =
    "h-9 flex w-full mb-4 mt-4 hover:opacity-80 cursor-pointer";
  const innerClasses = `flex items-center p-2 gap-3 rounded-md grow ${
    isSelected ? "bg-bt-blue-400 shadow-[inset_1.6px_1.6px_6.4px_#516495]" : ""
  }`;

  const Icon = navbarItem.icon;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut({ global: true });

      onLogout?.();
      onTabClick?.();

      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  if (isLogout) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={handleLogout}
        disabled={isSigningOut}
        aria-disabled={isSigningOut}
      >
        <div className={innerClasses}>
          <Icon className="w-5 h-5 shrink-0 text-bt-blue-0 overflow-visible" />
          <h6 className="text-bt-blue-0 text-sm font-medium">
            {isSigningOut ? "Signing out…" : navbarItem.title}
          </h6>
        </div>
      </button>
    );
  }

  return (
    <Link
      href={navbarItem.link || "#"}
      className={baseClasses}
      onClick={() => onTabClick?.()}
      prefetch={false}
    >
      <div className={innerClasses}>
        <Icon className="w-5 h-5 shrink-0 text-bt-blue-0 overflow-visible" />
        <h6 className="text-bt-blue-0 text-sm font-medium">
          {navbarItem.title}
        </h6>
      </div>
    </Link>
  );
};

export default NavbarTab;

import { signOut } from "@aws-amplify/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface NavbarProps {
  navbarItem: {
    title: string;
    link: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  onLogout?: () => void;
  onTabClick?: () => void; // Add this prop
}

const NavbarTab: React.FC<NavbarProps> = ({ navbarItem, onLogout, onTabClick }) => {
  const router = useRouter();
  const isSelected = router.pathname === navbarItem.link;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signOut();
      onLogout?.();
      onTabClick?.(); // Close mobile menu after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleNavClick = (e: React.MouseEvent) => {
    // For regular navigation, close the mobile menu
    onTabClick?.();
  };

  const handleClick = navbarItem.title === "Logout" ? handleLogout : handleNavClick;

  return (
    <Link
      href={navbarItem.link || "#"}
      className="h-9 flex w-full mb-4 mt-4 hover:opacity-80 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`flex items-center p-2 gap-3 rounded-md grow ${
          isSelected && "bg-events-active-tab-bg shadow-[inset_1.6px_1.6px_6.4px_#516495]"
        }`}
      >
        <navbarItem.icon className="w-5 h-5 shrink-0 text-pale-blue overflow-visible" />
        <h6 className="text-pale-blue text-sm font-medium">{navbarItem.title}</h6>
      </div>
    </Link>
  );
};

export default NavbarTab;
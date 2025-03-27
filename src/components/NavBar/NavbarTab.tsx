import { signOut } from "@aws-amplify/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavbarProps {
  navbarItem: {
    title: string;
    link: string;
    icon: any;
  };
}

const NavbarTab: React.FC<NavbarProps> = ({ navbarItem }) => {
  const router = useRouter();
  const isSelected = router.pathname === navbarItem.link;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Link
      href={navbarItem?.link}
      className="h-9 flex w-full mb-4 mt-4 hover:opacity-60 cursor-pointer"
      onClick={navbarItem.title === "Logout" ? handleLogout : undefined}
    >
      <div className={`w-0.5 ${isSelected && "bg-biztech-green"}`} />
      <div
        className={`flex items-center p-2 gap-2 grow ${
          isSelected && "bg-events-active-tab-bg"
        }`}
      >
        <Image
          src={navbarItem?.icon}
          alt="BizTech Logo"
          width={20}
          height={20}
          className="m-2"
        />
        <h6 className="text-white">{navbarItem?.title}</h6>
      </div>
    </Link>
  );
};

export default NavbarTab;

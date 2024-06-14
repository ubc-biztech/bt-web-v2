import BiztechLogo from "../../../public/assets/biztech_logo.svg";
import Image from "next/image";
import NavbarTab from "./NavbarTab";
import { admin, defaultUser, logout } from "./Tabs";

const isAdmin = true; // TO DO: retrieve this data

export default function Navbar() {
  return (
    <div className="pt-9 h-full w-[250px] bg-events-navigation-bg fixed flex flex-col justify-between p-6">
      <div>
        <div className="items-center flex gap-2">
          <Image src={BiztechLogo} alt="BizTech Logo" width={40} height={40} />
          <h5 className="font-600 text-white">UBC BizTech</h5>
        </div>
        <div className="w-full h-px bg-navbar-tab-hover-bg mb-4 mt-4" />
        {isAdmin && (
          <>
            {admin.map((navbarItem, index) => (
              <NavbarTab key={index} navbarItem={navbarItem} />
            ))}
            <div className="w-full h-px bg-navbar-tab-hover-bg mb-4 mt-4" />
          </>
        )}
        {defaultUser.map((navbarItem, index) => (
          <NavbarTab key={index} navbarItem={navbarItem} />
        ))}
      </div>
      <NavbarTab navbarItem={logout} />
    </div>
  );
}

import BiztechLogo from "../../../public/assets/biztech_logo.svg";
import Image from "next/image";
import NavbarTab from "./NavbarTab";
import { admin, defaultUser, logout } from "./Tabs";
import HamburgerMenu from "../../../public/assets/icons/hamburger_menu.svg";
import { isMobile } from "@/util/isMobile";
import { useState, useEffect } from "react";

const isAdmin = true; // TO DO: retrieve this data

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);

  useEffect(() => {
    if (isOpen && isMobileDevice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [isOpen, isMobileDevice]);

  return (
    <>
      {isMobileDevice && (
        <div className="p-4 fixed bg-events-navigation-bg w-full">
          <Image
            src={HamburgerMenu}
            alt="BizTech Logo"
            width={20}
            height={20}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      )}
      {((isOpen && isMobileDevice) || !isMobileDevice) && (
        <div
          className={`${
            isMobileDevice
              ? "fixed top-[52px] left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"
              : ""
          }`}
        >
          <div className="pt-9 h-full w-[250px] bg-events-navigation-bg absolute flex flex-col justify-between p-6">
            <div>
              <div className="items-center flex gap-2">
                <Image
                  src={BiztechLogo}
                  alt="BizTech Logo"
                  width={40}
                  height={40}
                />
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
        </div>
      )}
    </>
  );
}

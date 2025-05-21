import BiztechLogo from "../../../public/assets/biztech_logo.svg";
import Image from "next/image";
import NavbarTab from "./NavbarTab";
import { admin, defaultUser, logout, signin } from "../../constants/tabs";
import HamburgerMenu from "../../../public/assets/icons/hamburger_menu.svg";
import { isMobile } from "@/util/isMobile";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthError } from "@aws-amplify/auth";
import { fetchUserAttributes } from "@aws-amplify/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      setIsMobileDevice(isMobile(userAgent));
    }
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes?.email || "";
        const isAdmin = email.split("@")[1] === "ubcbiztech.com";
        setIsAdmin(isAdmin);
        setIsSignedIn(true);
      } catch (e) {
        if (
          e instanceof AuthError &&
          e.name === "UserUnAuthenticatedException"
        ) {
          setIsSignedIn(false);
        } else {
          console.error(e);
          setIsSignedIn(false);
        }
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <>
      {isMobileDevice && (
        <div className="p-4 fixed bg-events-navigation-bg w-full top-0 justify-between flex">
          <Image
            src={HamburgerMenu}
            alt="Hamburger Menu Icon"
            width={25}
            height={25}
            onClick={() => setIsOpen(!isOpen)}
          />
          <Image src={BiztechLogo} alt="Biztech Logo" width={30} height={30} />
        </div>
      )}
      {((isOpen && isMobileDevice) || !isMobileDevice) && (
        <div
          className={`${
            isMobileDevice
              ? "fixed top-[52px] left-0 right-0 bottom-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"
              : "fixed top-0 left-0 bottom-0"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            className="pt-9 h-full w-[250px] bg-events-navigation-bg absolute flex flex-col justify-between p-6"
            initial={isMobileDevice ? { x: "-100%" } : undefined}
            animate={isMobileDevice ? { x: 0 } : undefined}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
              {defaultUser(isAdmin, isSignedIn).map((navbarItem, index) => (
                <NavbarTab key={index} navbarItem={navbarItem} />
              ))}
            </div>
            {isSignedIn ? (
              <NavbarTab
                navbarItem={logout}
                onLogout={() => setIsSignedIn(false)}
              />
            ) : (
              <NavbarTab navbarItem={signin} />
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}

import Image from "next/image";
import NavbarTab from "./NavbarTab";
import { admin, defaultUser, logout, signin } from "../../constants/tabs";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthError } from "@aws-amplify/auth";
import { fetchUserAttributes } from "@aws-amplify/auth";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ScreenBreakpoints } from "@/constants/values";
import { throttle } from "lodash";

const NavbarTabs = ({
  isAdmin,
  isSignedIn,
  setIsSignedIn,
  onTabClick,
}: {
  isAdmin: boolean;
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
  onTabClick: () => void;
}) => {
  return (
    <>
      <div>
        <Link href="/" className="mb-8 items-center flex gap-4">
          <Image
            src="/assets/biztech_logo.svg"
            alt="BizTech Logo"
            width={32}
            height={32}
          />
          <h5 className="font-600 text-white text-lg">UBC BizTech</h5>
        </Link>

        {isAdmin && (
          <>
            {admin.map((navbarItem, index) => (
              <NavbarTab
                key={index}
                navbarItem={navbarItem}
                onTabClick={onTabClick}
              />
            ))}
            <div className="w-full h-px bg-bt-blue-300 my-8" />
          </>
        )}
        {defaultUser(isAdmin, isSignedIn).map((navbarItem, index) => (
          <NavbarTab
            key={index}
            navbarItem={navbarItem}
            onTabClick={onTabClick}
          />
        ))}
      </div>
      {isSignedIn ? (
        <NavbarTab
          navbarItem={logout}
          onLogout={() => setIsSignedIn(false)}
          onTabClick={onTabClick}
        />
      ) : (
        <NavbarTab navbarItem={signin} />
      )}
    </>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMobileDevice, setIsMobile] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < ScreenBreakpoints.Medium);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const throttledHandleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      const lastY = lastScrollYRef.current;

      if (currentScrollY > lastY && currentScrollY > 50) {
        if (isNavVisible) setIsNavVisible(false);
      } else if (currentScrollY < lastY) {
        if (!isNavVisible) setIsNavVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    }, 200);

    if (isMobileDevice) {
      window.addEventListener("scroll", throttledHandleScroll);
      return () => window.removeEventListener("scroll", throttledHandleScroll);
    }
  }, [isMobileDevice, isNavVisible]);

  useEffect(() => {
    if (!isMobileDevice) {
      setIsOpen(false);
    }
  }, [isMobileDevice]);

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
      {/* Mobile Header - shows/hides on scroll */}
      {isMobileDevice && (
        <motion.div
          className="p-4 h-16 bg-bt-blue-700 border-b border-bt-blue-300/40 shadow-lg w-full top-0 left-0 right-0 justify-between flex fixed z-40"
          initial={{ y: 0 }}
          animate={{ y: isNavVisible ? 0 : -64 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/biztech_logo.svg"
              alt="Biztech Logo"
              width={32}
              height={32}
            />
          </Link>
          <Menu
            className="text-white cursor-pointer"
            size={32}
            onClick={() => setIsOpen(!isOpen)}
          />
        </motion.div>
      )}

      {/* Desktop Sidebar - fixed position, doesn't scroll */}
      {!isMobileDevice && (
        <div className="fixed top-0 left-0 bottom-0 z-30">
          <div className="pt-9 h-full w-[250px] bg-bt-blue-700 flex flex-col justify-between p-6">
            <NavbarTabs
              isAdmin={isAdmin}
              isSignedIn={isSignedIn}
              setIsSignedIn={setIsSignedIn}
              onTabClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {isMobileDevice && isOpen && (
          <motion.div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 backdrop-filter shadow-lg backdrop-blur-lg z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="pt-9 h-full w-[250px] bg-bt-blue-700 flex flex-col justify-between p-6"
              initial={{ x: "100vw" }}
              animate={{ x: "calc(100vw - 250px)" }}
              exit={{ x: "100vw" }}
              transition={{
                type: "tween",
                ease: "easeInOut",
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <NavbarTabs
                isAdmin={isAdmin}
                isSignedIn={isSignedIn}
                setIsSignedIn={setIsSignedIn}
                onTabClick={() => setIsOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Image from "next/image";
import NavbarTab from "./NavbarTab";
import { admin, defaultUser, logout, signin } from "../../constants/tabs";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthError } from "@aws-amplify/auth";
import { fetchUserAttributes } from "@aws-amplify/auth";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMobileDevice, setIsMobile] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    if (isMobileDevice) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [lastScrollY, isMobileDevice]);

  // Close mobile menu when switching to desktop
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

  const RenderNavbarTabs = () => {
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
                  onTabClick={() => setIsOpen(false)}
                />
              ))}
              <div className="w-full h-px bg-navbar-tab-hover-bg my-8" />
            </>
          )}
          {defaultUser(isAdmin, isSignedIn).map((navbarItem, index) => (
            <NavbarTab
              key={index}
              navbarItem={navbarItem}
              onTabClick={() => setIsOpen(false)}
            />
          ))}
        </div>
        {isSignedIn ? (
          <NavbarTab
            navbarItem={logout}
            onLogout={() => setIsSignedIn(false)}
            onTabClick={() => setIsOpen(false)}
          />
        ) : (
          <NavbarTab navbarItem={signin} />
        )}
      </>
    );
  };

  return (
    <>
      {/* Mobile Header - shows/hides on scroll */}
      {isMobileDevice && (
        <motion.div
          className="p-4 h-16 bg-events-navigation-bg border-b border-dark-slate/40 shadow-lg w-full top-0 left-0 right-0 justify-between flex fixed z-40"
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
          <div className="pt-9 h-full w-[250px] bg-events-navigation-bg flex flex-col justify-between p-6">
            <RenderNavbarTabs />
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
              className="pt-9 h-full w-[250px] bg-events-navigation-bg flex flex-col justify-between p-6"
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
              <RenderNavbarTabs />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

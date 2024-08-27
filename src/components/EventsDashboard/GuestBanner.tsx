import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface GuestBannerProps {
  message?: string;
}

const GuestBanner: React.FC<GuestBannerProps> = ({ message }) => {
  const [visible, setVisible] = useState<boolean>(true);
  return (
    <>
      <AnimatePresence mode="popLayout">
        {visible && (
          <motion.div
            layout
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative p-5 pb-10 rounded-b-[5px] bg-login-form-card border-baby-blue border-l-2 border-b-2 border-r-2 w-full flex flex-col justify-center items-center top-0"
          >
            <div>{message}</div>
            <div className="mb-1">
              {" "}
              Click here to{" "}
              <Link className="underline" href={`/login`}>
                sign in
              </Link>{" "}
              or{" "}
              <Link className="underline" href={`/signup`}>
                register here
              </Link>{" "}
              if you don't have an account.
            </div>
            <X
              height={20}
              width={20}
              className="absolute left-[50%-20] bottom-2.5 md:right-5 md:top-[50%-20]"
              onClick={() => {
                setVisible(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuestBanner;

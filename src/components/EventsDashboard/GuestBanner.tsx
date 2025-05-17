import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
          >
            <Alert className="relative py-8 rounded-b-[5px] bg-login-form-card border-baby-blue w-full flex flex-col items-center">
              <AlertTitle className="text-white text-sm">{message}</AlertTitle>
              <AlertDescription className="text-white font-poppins text-sm">
                {" "}
                Click here to{" "}
                <Link className="underline" href={`/login`}>
                  sign in
                </Link>{" "}
                or{" "}
                <Link className="underline" href={`/signup`}>
                  register here
                </Link>{" "}
                {`if you don't have an account.`}
              </AlertDescription>
            </Alert>
            <X
              height={20}
              width={20}
              className="absolute top-2 right-2 md:top-4 md:right-4"
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

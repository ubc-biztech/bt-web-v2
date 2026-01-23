import React, { useState, useEffect } from "react";
import Image from "next/image";

// ============ 3D TRANSFORM CONSTANTS ============
// Camera/View controls
const PERSPECTIVE = 100000; // Higher = more orthographic
const TILT_X = 35; // Degrees to tilt back (rotateX)
const ROTATE_Z = -45; // Degrees to rotate around z-axis

// Z-axis layer heights (higher = closer to viewer)
const Z_PROFILE_CARD = 50; // Profile card
const Z_PROFILE_DROPSHADOW = 20; // Profile card dropshadow
const Z_LOGO = 30; // Company logo
const Z_LOGO_DROPSHADOW = 5; // Company logo dropshadow
const Z_NFC_CARD = 0; // Base NFC card

// Animation settings
const ANIMATION_RANGE = 25; // Max random offset in px
const ANIMATION_INTERVAL = 4000; // How often to change (ms) - match transition duration
const TRANSITION_DURATION = "4s";
const TRANSITION_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// Mount spin settings
const MOUNT_SPIN_DURATION = "1.9s";
const MOUNT_SPIN_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

// ================================================

const ThreeDcard = ({
  fname,
  lname,
  company,
  logo,
  pfp,
  major,
  year,
}: {
  fname: string;
  lname: string;
  pfp: string;
  major: string;
  year: string;
  company: string;
  logo: string;
}) => {
  // Separate offsets for each element group
  // Profile & Logo: only positive (float UP from original)
  // NFC Card: only negative (sink DOWN from original)
  const [profileOffset, setProfileOffset] = useState(0);
  const [logoOffset, setLogoOffset] = useState(0);
  const [nfcOffset, setNfcOffset] = useState(0);

  // Mount spin: starts at -250, transitions to 0
  const [sceneRotation, setSceneRotation] = useState(-250);

  // Initial 360 spin on mount
  useEffect(() => {
    // Use requestAnimationFrame to ensure the initial -360 is painted first
    // Then trigger the spin to 0 on the next frame
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSceneRotation(0);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Continuous z-height animation
  useEffect(() => {
    const animate = () => {
      // Profile card: random 0 to ANIMATION_RANGE (only UP)
      setProfileOffset(Math.random() * ANIMATION_RANGE);
      // Logo: random 0 to ANIMATION_RANGE (only UP)
      setLogoOffset(Math.random() * ANIMATION_RANGE);
      // NFC card: random 0 to -ANIMATION_RANGE (only DOWN)
      setNfcOffset(-Math.random() * ANIMATION_RANGE);
    };

    animate();
    const interval = setInterval(animate, ANIMATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const transitionStyle = {
    transition: `transform ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
  };

  return (
    // Scene container - sets up 3D perspective
    <div
      style={{ perspective: `${PERSPECTIVE}px` }}
      className="flex items-center justify-center"
    >
      {/* Camera - controls tilt and rotation */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${TILT_X}deg) rotateZ(${ROTATE_Z}deg)`,
        }}
      >
        {/* 3D Scene content - 360 spin on mount */}
        <div
          className="relative"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateZ(${sceneRotation}deg)`,
            transition: `transform ${MOUNT_SPIN_DURATION} ${MOUNT_SPIN_EASING}`,
          }}
        >
          {/* Profile card and company logo container */}
          <div
            className="flex items-center justify-between w-[350px] absolute top-0 left-1/2 px-4"
            style={{
              transformStyle: "preserve-3d",
              transform: "translateX(-50%) translateY(50%)",
            }}
          >
            {/* Profile card section - locked together with shared offset */}
            <div style={{ transformStyle: "preserve-3d" }} className="relative">
              {/* Dashed border shadow */}
              <div
                className="absolute inset-0 w-full h-full rounded-xl border-2 border-dashed border-white/50 pointer-events-none"
                style={{
                  transform: `translateZ(${Z_PROFILE_DROPSHADOW + profileOffset}px)`,
                  ...transitionStyle,
                }}
              />
              {/* Profile card content - transformStyle: flat to enable backdrop-blur */}
              <div
                className="flex items-start align-center gap-2 rounded-xl backdrop-blur-sm bg-white/10 border border-white/40 shadow-[inset_0_0_8px_rgba(255,255,255,0.3)] p-2"
                style={{
                  transform: `translateZ(${Z_PROFILE_CARD + profileOffset}px)`,
                  transformStyle: "flat",
                  ...transitionStyle,
                }}
              >
                {pfp && (
                  <Image
                    src={pfp}
                    alt="Profile Picture"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                )}
                {fname && lname && year && major && (
                  <div className="flex flex-col">
                    <div className="text-[18px] text-white font-medium">
                      {fname + " " + lname}
                    </div>
                    <div className="font-mono text-xs text-white/70 font-thin">
                      {major.toUpperCase() + ", YEAR" + year}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company logo section - locked together with shared offset */}
            <div style={{ transformStyle: "preserve-3d" }} className="relative">
              {/* Dashed border shadow */}
              <div
                className="absolute inset-0 w-[60px] h-[60px] rounded-full border-2 border-dashed border-white/50 pointer-events-none"
                style={{
                  transform: `translateZ(${Z_LOGO_DROPSHADOW + logoOffset}px)`,
                  ...transitionStyle,
                }}
              />
              {/* Logo */}
              <div
                style={{
                  transform: `translateZ(${Z_LOGO + logoOffset}px)`,
                  ...transitionStyle,
                }}
              >
                <Image
                  src={logo}
                  alt="Company Logo"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>

          {/* NFC Card - base layer, only sinks DOWN */}
          <div
            className="pt-16"
            style={{
              transform: `translateZ(${Z_NFC_CARD + nfcOffset}px)`,
              ...transitionStyle,
            }}
          >
            <Image
              src="/assets/blueprint/nfc-card.svg"
              width={260}
              alt="NFC Card"
              height={100}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDcard;

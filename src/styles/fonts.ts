import localFont from "next/font/local";

export const bricolageGrotesque = localFont({
  src: "../assets/fonts/bricolage-grotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  preload: false,
});

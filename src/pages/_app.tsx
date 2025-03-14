import "@/styles/globals.css"
import "@/styles/fonts.css"
import "@/styles/animations.css"
import type { AppProps } from "next/app"
import Layout from "./layout"
import Head from "next/head"
import { useRouter } from "next/router"
import { Red_Hat_Mono } from "next/font/google"

const redHatMono = Red_Hat_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"]
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Pages that should NOT use the Layout
  const noLayoutPaths = [
    "/login",
    "/signup",
    "/account-creation",
    "/membership",
    "/register",
    "/verify",
    "/forgot-password"
  ]
  const isNoLayoutPage = noLayoutPaths.includes(router.pathname)

  // Companion mode theming
  const isCompanionPath = router.pathname.startsWith("/companion")

  const content = (
    <>
      <Head>
        <title>UBC BizTech</title>
        <meta
          name="description"
          content="UBC BizTech - Bridging the gap between business, technology and you. UBC's largest business technology club."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ubcbiztech.com" />
        <meta property="og:title" content="UBC BizTech" />
        <meta
          property="og:description"
          content="UBC BizTech - Bridging the gap between business, technology and you. UBC's largest business technology club."
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ubcbiztech.com" />
        <meta name="twitter:title" content="UBC BizTech" />
        <meta
          name="twitter:description"
          content="UBC BizTech - Bridging the gap between business, technology and you. UBC's largest business technology club."
        />

        {/* Theme and Colors */}
        <meta
          name="theme-color"
          content={isCompanionPath ? "#030608" : "#2A5298"}
        />

        {/* Favicon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#2A5298" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://ubcbiztech.com" />
      </Head>

      <main
        className={`${redHatMono.className} ${isCompanionPath ? "dark" : ""}`}
      >
        <div className={isCompanionPath ? "min-h-screen" : ""}>
          <Component {...pageProps} />
        </div>
      </main>
    </>
  )

  if (isCompanionPath) {
    return content
  }

  if (isNoLayoutPage) {
    return content
  }

  // Otherwise, wrap it in the Layout
  return <Layout>{content}</Layout>
}

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import LogoutButton from "./LogoutButton";
import FeedbackForm from "./FeedbackForm";
import Schedule from "./Schedule";
import { COLORS } from "@/constants/theme";
import { constantStyles } from "@/constants/companion";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  id?: string;
}

function FadeInWhenVisible({ children, style, id }: FadeInWhenVisibleProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      style={style}
      id={id}
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.3 }}
      variants={{
        visible: { opacity: 1, scale: 1 },
        hidden: { opacity: 1, scale: 0.8 }
      }}
    >
      {children}
    </motion.div>
  );
}

interface CompanionLayoutProps {
  options: {
    BiztechLogo: string;
    Logo: string;
    BackgroundImage?: string;
    title: string;
    date: string;
    location: string;
    extraStyles?: Record<string, any>;
    colors: {
      background: string;
      primary: string;
    };
    welcomeData?: string[];
    headers: Array<{ id?: string; route?: string; text: string }>;
    disableWelcomeHeader?: boolean;
    landing?: string;
  };
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string;
  userRegistration: any;
  registrations: any[];
  event: any;
  scheduleData: any[];
  ChildComponent: React.ComponentType<any>;
}

const CompanionLayout = ({
  options,
  email,
  setEmail,
  isLoading,
  error,
  userRegistration,
  registrations,
  event,
  scheduleData,
  ChildComponent,
}: CompanionLayoutProps) => {
  const [input, setInput] = useState("");
  const [transition, setShowTransition] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const styles = {
    container: {
      backgroundColor: options.BackgroundImage ? "#F5EE9E" : "transparent",
      backgroundImage: options.BackgroundImage ? `url(${options.BackgroundImage})` : options.colors.background,
      backgroundRepeat: "repeat",
      overflow: "hidden",
      minHeight: "100vh",
      display: "flex",
      padding: "10px",
      flexDirection: "column" as const,
      width: "100%",
    },
    introLogo: {
      width: "60%",
      height: "auto",
      marginBottom: "20px",
    },
    homeLogo: {
      marginTop: "24px",
      width: "20%",
      height: "auto",
    },
    mobileHomeLogo: {
      marginTop: "24px",
      width: "35%",
      height: "auto",
    },
    column: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "25px",
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      scrollMarginTop: "110px"
    },
    nav: {
      display: "flex",
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "25px",
      width: "100%",
    },
    video: {
      position: "fixed" as const,
      top: "0px",
      right: "-18px",
      left: "-15px",
      height: "120%",
      width: "auto",
      minWidth: "120vw",
      minHeight: "100vh",
      overflow: "hidden",
      display: "block",
      userSelect: "none",
    },
    feedbackIFrameContainer: {
      backgroundColor: "transparent",
      marginTop: "10px",
      marginBottom: "10px",
      border: "solid",
      borderColor: "rgba(1, 1, 1, 0.1)",
      borderWidth: "3px",
      borderRadius: 10,
      width: "90%"
    },
    feedbackIFrame: {
      width: "100%",
      height: "60vh",
      border: "none",
    },
    tableBorder: {
      backgroundColor: "transparent",
      marginTop: "10px",
      marginBottom: "10px",
      border: "solid",
      borderColor: "rgba(1, 1, 1, 0.1)",
      borderWidth: "3px"
    },
    partners: {
      width: "100%"
    },
    schedule: {
      width: "60%",
    },
    scheduleMobile: {
      width: "90%",
    },
    landing: {
      paddingBottom: "20px",
    },
    subheading: {
      color: constantStyles.textColor,
      textAlign: "center" as const,
    },
    listItem: {
      color: constantStyles.textColor,
      textAlign: "left" as const,
    },
    tabImage: {
      height: "300px",
    },
    ...options.extraStyles
  };

  useEffect(() => {
    videoRef.current?.load();
    handlePlay();
  }, [showBackground]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTransition(false);
    }, 2200);
    const backgroundId = setTimeout(() => {
      setShowBackground(true);
    }, 4000);
    
    if (window.screen.width > 500) {
      setShowTransition(false);
      setShowVideo(false);
    }
    handlePlay();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(backgroundId);
    };
  }, []);

  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video.click();
      video.play().catch(error => {
        console.error("Autoplay prevented:", error);
      });
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className={(!email || !userRegistration) ? "p-0" : ""} style={styles.container}>
      {(!email || !userRegistration) ? (
        <Card className="flex justify-center overflow-hidden">
          {!transition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="fixed z-10"
            >
              <div className="flex flex-col items-center justify-center min-h-screen w-full">
                <Image 
                  src={options.BiztechLogo} 
                  alt={`${options.title} Logo`}
                  width={500}
                  height={200}
                  quality={100}
                  sizes="100vw"
                  className="w-1/2 sm:w-3/5 mb-5"
                  priority
                />
                <h1 className="text-2xl font-bold mb-2 text-white">Welcome!</h1>
                <p className="text-center mb-4 text-white p1">
                  Please enter the email you used to register for {options.title}
                </p>
                <Input
                  className="mb-4 w-64"
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder="Email"
                  type="email"
                />
                <Button
                  onClick={() => setEmail(input)}
                  className="mb-4"
                >
                  Confirm
                </Button>
                {error && (
                  <p className="text-red-500 text-center w-4/5">{error}</p>
                )}
              </div>
            </motion.div>
          )}
        </Card>
      ) : (
        <ScrollArea className="banner" role="banner">
          <FadeInWhenVisible style={{
            ...styles.column,
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            width: "100%",
            background: options.colors.background,
            zIndex: "9999",
            paddingBottom: "0.75rem"
          }}>
            <LogoutButton />
            {!event && !registrations && (
              <Image 
                src={options.Logo} 
                alt={`${options.title} Logo`}
                width={200}
                height={100}
                className="w-1/5 sm:w-1/3 mt-6"
                priority
              />
            )}
            <nav className="w-full flex justify-between items-center">
              {options.welcomeData && !options.disableWelcomeHeader && (
                <Link href="#Welcome" className="text-base flex-grow text-center">
                  Welcome
                </Link>
              )}
              {scheduleData && scheduleData.length > 0 && (
                <Link href="#Schedule" className="text-base flex-grow text-center">
                  Schedule
                </Link>
              )}
              {options.headers.map((header, i) => (
                header.id ? (
                  <Link 
                    href={`#${header.id}`} 
                    key={i} 
                    className="text-base flex-grow text-center"
                  >
                    {header.text}
                  </Link>
                ) : (
                  <Link 
                    href={header.route || ''} 
                    key={i}
                    className="text-base flex-grow text-center"
                  >
                    {header.text}
                  </Link>
                )
              ))}
            </nav>
          </FadeInWhenVisible>

          <div className="h-28" />
          
          {event?.isCompleted && event?.feedback && (
            <FadeInWhenVisible>
              <FeedbackForm 
                feedbackLink={event.feedback} 
                headerText="Thanks for attending!" 
              />
            </FadeInWhenVisible>
          )}

          <FadeInWhenVisible id="welcome" style={styles.column}>
            {options.landing && (
              <Image 
                src={options.landing}
                className="w-[90%] sm:w-2/5 mt-auto sm:mt-12 pb-5"
                alt="Landing"
                width={500}
                height={200}
                priority
              />
            )}
            <h1 id="Welcome" className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent"
                style={{ backgroundImage: options.colors.primary }}>
              Hello, {userRegistration.fname}!
            </h1>
            
            {event?.isCompleted ? (
              <p className="text-center text-base sm:text-lg mb-4 w-4/5">
                The event is now over, please head back to the main room, we hope you enjoyed your time 😊!
              </p>
            ) : (
              options.welcomeData?.map((paragraph, i) => (
                <p key={i} className="text-center text-base sm:text-lg mb-4 w-4/5">
                  {paragraph}
                </p>
              ))
            )}
          </FadeInWhenVisible>

          {scheduleData.length > 0 && (
            <FadeInWhenVisible id="Timeline">
              <Schedule 
                data={scheduleData} 
                date={options.date} 
                location={options.location} 
              />
            </FadeInWhenVisible>
          )}

          <ChildComponent 
            event={event} 
            registrations={registrations} 
            userRegistration={userRegistration} 
          />
        </ScrollArea>
      )}
    </div>
  );
};

export default CompanionLayout; 
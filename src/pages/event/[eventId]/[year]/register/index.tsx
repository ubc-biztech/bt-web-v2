"use client";
import { AttendeeEventRegistrationForm } from "@/components/Events/AttendeeEventRegistrationForm";
import {
  ApplicationStatus,
  BiztechEvent,
  DBRegistrationStatus,
  User,
} from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { fetchBackend } from "@/lib/db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import {
  fetchAuthSession,
  signIn,
  fetchUserAttributes,
} from "@aws-amplify/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuestionTypes } from "@/constants/questionTypes";
import { cleanOtherQuestions } from "@/util/registrationQuestionHelpers";
import { CLIENT_URL } from "@/lib/dbconfig";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function AttendeeFormRegister() {
  const router = useRouter();
  const { eventId, year } = router.query;
  const [event, setEvent] = useState<BiztechEvent>({} as BiztechEvent);
  const [isEventFull, setIsEventFull] = useState<boolean>(false);
  const [regAlert, setRegAlert] = useState<JSX.Element | null>(null);
  const [user, setUser] = useState<User>({} as User);
  const [isNonMemberModalOpen, setIsNonMemberModalOpen] =
    useState<boolean>(true);
  const [userRegistered, setUserRegistered] = useState<boolean>(false);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [hasShownMemberToast, setHasShownMemberToast] =
    useState<boolean>(false);
  const { toast } = useToast();

  const isAlumniNight = event?.id === "alumni-night";

  const samePricing = () => {
    return event.pricing?.members === event.pricing?.nonMembers;
  };

  const priceDiff = () => {
    return event.pricing?.nonMembers - event.pricing?.members;
  };

  const isDeadlinePassed = () => {
    const deadline = Date.parse(event.deadline);
    // get the timestamp down to millisconds
    return deadline < Date.now();
  };

  const checkRegistered = async (email: string): Promise<Boolean> => {
    const registrations = await fetchBackend({
      endpoint: `/registrations?email=${email}`,
      method: "GET",
      authenticatedCall: false,
    });
    const exists: boolean = registrations.data.some(
      (reg: any) => reg["eventID;year"] === event.id + ";" + event.year,
    );
    setUserRegistered(exists);
    return exists;
  };
  
  const redirectUnauthenticatedUser = () => {
    const redirect = router.asPath || `/event/${eventId}/${year}/register`;
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (tokens) {
          const attributes = await fetchUserAttributes();
          const email = attributes?.email;

          if (!email) throw new Error("Email not found for user");

          const userData = await fetchBackend({
            endpoint: `/users/${email}`,
            method: "GET",
          });

          setUser(userData);
          setUserLoggedIn(true);
        } else {
          setUserLoggedIn(false);
        }
      } catch (err: any) {
        if (!err.status) {
          // not authenticated at all
          redirectUnauthenticatedUser();
        }
        // authenticated but not member
        console.error("Failed to fetch user:", err);
        setUserLoggedIn(false);
      }
      setUserLoading(false);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId || !year) {
        return;
      }
      const eventData = await fetchBackend({
        endpoint: `/events/${eventId}/${year}`,
        method: "GET",
        data: undefined,
        authenticatedCall: false,
      });

      const params = new URLSearchParams({
        count: String(true),
      });
      const regData = await fetchBackend({
        endpoint: `/events/${eventId}/${year}?${params}`,
        method: "GET",
        data: undefined,
        authenticatedCall: false,
      });
      eventData.counts = regData;
      setEvent(eventData);
    };
    fetchEvent();
  }, [eventId, year]);

  useEffect(() => {
    if (userLoggedIn) checkRegistered(user.id);

    const remaining =
      event.capac -
      (event.counts?.registeredCount + event.counts?.checkedInCount);
    if (remaining > 0 && remaining <= 20) {
      setRegAlert(
        <Alert className="mx-4 my-5 w-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            {event.ename || "This event"} only has {remaining} spot
            {remaining > 1 ? "s" : ""} left!
          </AlertDescription>
        </Alert>,
      );
    } else if (remaining <= 0) {
      // } else if (remaining <= 0 && !user) {
      setIsEventFull(true);
    } else {
      setRegAlert(null);
    }

    if (
      !(
        user?.isMember ||
        user?.admin ||
        event.pricing?.nonMembers === undefined ||
        samePricing()
      )
    ) {
      setIsNonMemberModalOpen(true);
    }

    // Show member discount toast for non-signed-in users
    if (
      !userLoading &&
      !userLoggedIn &&
      priceDiff() > 0 &&
      !hasShownMemberToast
    ) {
      toast({
        title: "💡 Member Discount Available!",
        description: `Sign in as a member to save $${priceDiff().toFixed(2)} on this event!`,
        duration: 8000, // Show for 8 seconds
      });
      setHasShownMemberToast(true);
    }
  }, [event, user, userLoggedIn, userLoading, hasShownMemberToast, toast]);

  // TODO?: are cancellations even useful? I don't think it's ever been used before.
  // TODO: implement dynamic workshop counts

  const cleanFormData = (data: any) => {
    if (!event?.registrationQuestions) return;
    for (let question of event?.registrationQuestions) {
      if (question.type === QuestionTypes.CHECKBOX && data.customQuestions) {
        data.customQuestions[question.questionId] = cleanOtherQuestions(
          data?.customQuestions[question.questionId],
        );
      }
    }
  };

  const handleSubmit = async (data: any): Promise<Boolean> => {
    cleanFormData(data);

    if (!userLoggedIn && (await checkRegistered(data["emailAddress"]))) {
      return false;
    }

    const basicInformation = {
      fname: data["firstName"],
      lname: data["lastName"],
      gender: data["preferredPronouns"],
      diet: data["dietaryRestrictions"],
      heardFrom: data["howDidYouHear"],
      ...(!isAlumniNight && {
        year: data["yearLevel"],
        faculty: data["faculty"],
        major: data["majorSpecialization"],
      }),
    };

    const registrationData = {
      email: data["emailAddress"],
      fname: data["firstName"],
      studentId: data["studentId"],
      eventID: eventId,
      year: parseInt(year as string),
      registrationStatus: DBRegistrationStatus.REGISTERED,
      isPartner: false,
      points: 0,
      basicInformation,
      dynamicResponses: data["customQuestions"],
      applicationStatus: event.isApplicationBased
        ? ApplicationStatus.REVIEWING
        : "",
    };

    try {
      await fetchBackend({
        endpoint: "/registrations",
        method: "POST",
        data: registrationData,
        authenticatedCall: false,
      });
      await router.push(`/event/${eventId}/${year}/register/success`);
      return true;
    } catch (error) {
      alert(
        `An error has occured: ${error} Please contact an exec for support. 4`,
      );
      return false;
    }
  };

  const handlePaymentSubmit = async (data: any): Promise<Boolean> => {
    cleanFormData(data);

    if (!userLoggedIn && (await checkRegistered(data["emailAddress"]))) {
      return false;
    }

    const registrationData = {
      email: data["emailAddress"],
      fname: data["firstName"],
      studentId: data["studentId"],
      eventID: eventId,
      year: parseInt(year as string),
      registrationStatus: DBRegistrationStatus.INCOMPLETE,
      isPartner: false,
      points: 0,
      basicInformation: {
        fname: data["firstName"],
        lname: data["lastName"],
        year: data["yearLevel"],
        faculty: data["faculty"],
        major: data["majorSpecialization"],
        gender: data["preferredPronouns"],
        diet: data["dietaryRestrictions"],
        heardFrom: data["howDidYouHear"],
      },
      dynamicResponses: data["customQuestions"],
      applicationStatus: event.isApplicationBased
        ? ApplicationStatus.REVIEWING
        : "",
    };

    try {
      const res = await fetchBackend({
        endpoint: "/registrations",
        method: "POST",
        data: registrationData,
        authenticatedCall: false,
      });
      if (res.url) {
        window.open(res.url, "_self");
        return true;
      } else {
        const paymentData = {
          paymentName: `${event.ename} ${
            user?.isMember || samePricing() ? "" : "(Non-member)"
          }`,
          paymentImages: [event.imageUrl],
          paymentPrice:
            (user?.isMember
              ? event.pricing?.members
              : event.pricing?.nonMembers) * 100,
          paymentType: "Event",
          success_url: `${
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : CLIENT_URL
          }event/${event.id}/${event.year}/register/success`,
          // cancel_url: `${process.env.REACT_APP_STAGE === "local"
          //   ? "http://localhost:3000/"
          //   : CLIENT_URL
          // }event/${event.id}/${event.year}/register`,
          email: data["emailAddress"],
          fname: data["firstName"],
          eventID: eventId,
          year: year,
        };

        try {
          const res = await fetchBackend({
            endpoint: "/payments",
            method: "POST",
            data: paymentData,
            authenticatedCall: false,
          });
          if (event.isApplicationBased) {
            router.push(
              `/event/${eventId}/${year}/register/success?isApplicationBased=${true}`,
            );
          } else {
            window.open(res, "_self");
          }
          return true;
        } catch (error) {
          alert(
            `An error has occured: ${error} Please contact an exec for support.`,
          );
          return false;
        }
      }
    } catch (error) {
      alert(
        `An error has occured: ${error} Please contact an exec for support.`,
      );
      return false;
    }
  };

  const renderErrorText = (children: JSX.Element) => {
    return (
      <div className="flex text-white">
        <div className="space-y-4 p-4 max-w-lg mx-auto py-10">
          <div
            className={`aspect-video bg-gray-200 rounded-lg flex relative items-center justify-center overflow-hidden`}
          >
            {event?.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt="Event Cover"
                fill
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">Event Cover Photo</span>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  };

  const renderIsNonMemberDialog = () => {
    return (
      <Dialog
        open={isNonMemberModalOpen}
        onOpenChange={setIsNonMemberModalOpen}
      >
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Hey there!</DialogTitle>
            <DialogDescription className="mt-2 space-y-4">
              <p>
                We noticed you aren&apos;t a member yet. This may be because you
                aren&apos;t signed in, or your account hasn&apos;t been
                registered to become a member for this academic year.
              </p>
              <p>
                This event is available to non-members, but please note that you
                will be paying $
                {event?.pricing?.nonMembers && event?.pricing?.members
                  ? (
                      event.pricing?.nonMembers - event.pricing?.members
                    ).toFixed(2)
                  : "7.00"}{" "}
                more.
              </p>
              <p>
                Consider registering as a member this year to get access to ALL
                of our events at the best price!
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4">
            <Button
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/signup")}
            >
              Register
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/login")}
            >
              Sign-in
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => setIsNonMemberModalOpen(false)}
            >
              Continue anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderConditionalViews = () => {
    if (userLoading) return null;

    // wait for fields to load, otherwise the views will display a flash change
    if (!event || !user || !event.pricing) return null;
    // deadline passed

    // TODO: Maybe put stripe link here if user registers, but doesn't complete payment. There status will be
    // INCOMPLETE, but they won't have access to the same checkout session.
    if (userRegistered) {
      return renderErrorText(
        <div className="text-center">
          <p className="text-l mb-4 text-white">
            You&apos;ve already registered!
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
            onClick={() => (window.location.href = "/")}
          >
            Upcoming Events
          </button>
        </div>,
      );
    } else if (isDeadlinePassed()) {
      return renderErrorText(
        <div className="text-center">
          <p className="text-l mb-4 text-white">
            Sorry, the deadline for registration has passed on{" "}
            {new Date(event.deadline).toDateString()}.
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
            onClick={() => (window.location.href = "/")}
          >
            Upcoming Events
          </button>
        </div>,
      );
      // Event full
    } else if (isEventFull) {
      return renderErrorText(
        <>
          <div className="text-center">
            <p className="text-xl mb-4 text-white">
              Sorry, this event is full.
            </p>
            <p className="text-lg mb-4 text-white">
              Please check back for future events.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
              onClick={() => (window.location.href = "/")}
            >
              Upcoming Events
            </button>
          </div>
        </>,
      );
    }
    // members only
    else if (
      (!user || !user.isMember) &&
      event.pricing?.nonMembers === undefined
    ) {
      return renderErrorText(
        <div className="text-center">
          <p className="text-l mb-4 text-white">
            Sorry, this event is for members only. This event is for members
            only. To access the form, please sign in or register for a
            membership.
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md"
            onClick={() => (window.location.href = "/login")}
          >
            Register
          </button>
        </div>,
      );

      // regular
    } else if (event && event.registrationQuestions) {
      {
        event?.pricing?.nonMembers &&
          event?.pricing?.members &&
          event?.pricing?.members != event?.pricing?.nonMembers &&
          renderIsNonMemberDialog();
      }
      return (
        <AttendeeEventRegistrationForm
          onSubmit={handleSubmit}
          onSubmitPayment={handlePaymentSubmit}
          event={event}
          user={user}
        />
      );
    }
  };

  return (
    <main className="bg-bt-blue-600 min-h-screen">
      <div className="mx-auto flex flex-col">
        {regAlert}
        {event && renderConditionalViews()}
      </div>
    </main>
  );
}

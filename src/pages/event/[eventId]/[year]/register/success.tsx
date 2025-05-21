import React, { useState } from "react";
import { LinkIcon } from "lucide-react";
import { useRouter } from "next/router";
import { CLIENT_URL } from "@/lib/dbconfig";

const SuccessPage = () => {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const { eventId, year } = router.query;
  const { isApplicationBased } = router.query;
  const isApplicationBasedBoolean = isApplicationBased === "true";

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        CLIENT_URL + `event/${eventId}/${year}`,
      );
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000); // Reset after 3 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <div className="bg-primary-color text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {isApplicationBasedBoolean ? (
          <>
            <h1 className="text-white text-4xl font-bold mb-4">
              We&apos;ve got your application!
            </h1>

            <div className="rounded-lg p-6 mb-8">
              <p className="mb-2 text-white">
                Thanks for applying! We&apos;ll be reviewing your application
                soon and will email you soon about your application status!
              </p>
              <p className="mb-4 text-white">
                Click here to view your application status.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-white text-4xl font-bold mb-4">
              See you soon!
            </h1>

            <div className="rounded-lg p-6 mb-8">
              <p className="mb-2">
                You&apos;ve successfully registered to the event.
              </p>
              <p className="mb-4">
                We&apos;ve sent you two emails, one with a calendar invite and
                one with a QR code to check-in to our event!
              </p>
              <p className="font-semibold">
                Please be sure to check your Spam or Promotions inboxes as well.
              </p>
            </div>
          </>
        )}

        <div className="text-white rounded-lg">
          <h2 className="text-white text-3xl font-bold mb-4 border-green-500">
            What&apos;s next?
          </h2>
          <div className="mb-4">
            <button
              onClick={copyLinkToClipboard}
              className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              <span className="mr-2">Share the event with friends!</span>
              <LinkIcon className="h-5 w-5" />
            </button>
            {linkCopied && (
              <p className="text-yellow-400 font-semibold mt-2 animate-pulse ml-6">
                Registration Link Copied to Clipboard!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 flex flex-col items-end sm:flex-row sm:items-center">
        <div className="bg-white text-black p-3 sm:p-4 rounded-lg shadow-lg mb-2 sm:mb-0 sm:mr-4 max-w-[80vw] sm:max-w-none">
          <p className="font-semibold text-sm sm:text-base">
            Got some more stuff cooking, stay tuned!
          </p>
        </div>
        <div className="bg-green-500 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center">
          <span className="text-xl sm:text-2xl">🏠</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

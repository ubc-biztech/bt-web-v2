import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import { fetchBackend } from "@/lib/db";
import Link from "next/link";

const CompanionRedirectPage = () => {
  const router = useRouter();
  const { data } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const email = localStorage.getItem(COMPANION_EMAIL_KEY);
      const teamID = localStorage.getItem(TEAM_NAME);

      if (!router.isReady) {
        return;
      }
      if (!email) {
        router.push(`/companion?redirect=/companion/redirect/${data}`);
        return;
      }

      if (!teamID) {
        setError("You currently have no team assigned, or need to sign in again");
        setLoading(false);
        return;
      }

      // Decode the base64 data to get the array of IDs
      const decodedString = Buffer.from(data as string, "base64").toString();
      console.log(decodedString);
      const decodedData: String[] = JSON.parse(decodedString);

      if (!Array.isArray(decodedData) || decodedData.length === 0) {
        setError("Data is invalid, contact an Exec");
        console.error("Data: ", decodedData);
        return;
      }

      if (!Array.isArray(decodedData)) {
        throw new Error("Invalid data format");
      }

      fetchBackend({
        endpoint: `/team/judge/currentTeam/${teamID}`,
        method: "PUT",
        data: { judgeIDs: decodedData },
        authenticatedCall: false
      });

      setLoading(false);

      router.push("/companion");
    } catch (err) {
      setError("Failed to process the data");
      setLoading(false);
    }
  }, [data, router.isReady]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen flex-col bg-[#020319]'>
        <div className='animate-spin w-10 h-10 border-4 border-[#41437D] border-t-[#4CC8BD] rounded-full'></div>
        <p className='mt-4 text-[#ADAFE4] font-ibm'>Updating judging information...</p>
      </div>
    );
  }

  if (error.length > 0) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen bg-[#020319] p-5'>
        <div className='text-xl font-ibm text-white text-center'>{error}</div>
        <div className='ml-6'>
          <Link href='/companion' className='text-[#4CC8BD] hover:text-[#7EEAE0] underline font-ibm text-sm transition-colors'>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-[#020319]'>
      <div className='text-xl font-ibm text-white'>Request processed successfully!</div>
    </div>
  );
};

export default CompanionRedirectPage;

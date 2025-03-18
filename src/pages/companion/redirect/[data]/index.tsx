import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { COMPANION_EMAIL_KEY, TEAM_NAME } from "@/constants/companion";
import { fetchBackend } from "@/lib/db";

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

      // After successful processing, you might want to redirect somewhere else
      // router.push('/some-destination');
    } catch (err) {
      setError("Failed to process the data");
      setLoading(false);
    }
  }, [data, router.isReady]);

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' flexDirection='column'>
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          Updating judging information...
        </Typography>
      </Box>
    );
  }

  if (error.length > 0) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography variant='h6' color='error'>
          {error}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant='body2'>
            <a href='/companion' style={{ color: "#1976d2", textDecoration: "underline" }}>
              Return to companion page
            </a>
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
      <Typography variant='h6' className='text-white'>
        Request processed successfully!
      </Typography>
    </Box>
  );
};

export default CompanionRedirectPage;

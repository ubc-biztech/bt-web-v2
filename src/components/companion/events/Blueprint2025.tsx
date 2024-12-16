import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface BlueprintProps {
  event: any;
  registrations: any[];
  userRegistration: any;
}

const Blueprint2025 = ({ event, registrations, userRegistration }: BlueprintProps) => {
  const [tabValue, setTabValue] = useState("schedule");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const rewardsPoints = {
    "Meta Quest": 180,
    "FitBit 6": 130,
    "Kindle": 100,
    "Amazon Echo Speaker": 80,
    "Blueprint Hoodie": 50,
  };

  const activities = [
    { name: "Early check-in", points: 25 },
    { name: "Scan a professional's LinkedIn QR Code", points: 25 },
    { name: "Ask a question during panel", points: 20 },
    { name: "Attend a workshop", points: 25 },
    { name: "Post Instagram story with event filter", points: 30 },
    { name: "Take a photo at photo booth", points: 20 },
    { name: "Vote for a project", points: 35 },
    { name: "Get professional headshot", points: 20 },
    { name: "Participate in showcase", points: 25 },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await fetchBackend({
          endpoint: `/registrations/leaderboard/?eventID=${event?.id}&year=${event?.year}`,
          method: "GET",
          authenticatedCall: false
        });
        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, [event]);

  const nextReward = Object.entries(rewardsPoints)
    .sort(([, a], [, b]) => a - b)
    .find(([, points]) => (userRegistration?.points || 0) < points);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Today&#39;s Schedule</h2>
            {/* Add schedule content */}
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-xs">
                <Progress 
                  value={(userRegistration?.points || 0) / (nextReward?.[1] || 100) * 100} 
                />
                <p className="text-center mt-2">
                  {userRegistration?.points || 0} points
                </p>
              </div>
              
              {nextReward && (
                <p className="text-center">
                  {nextReward[1] - (userRegistration?.points || 0)} points away from {nextReward[0]}!
                </p>
              )}

              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex justify-between p-2 border rounded">
                      <span>{activity.name}</span>
                      <span>{activity.points} points</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="showcase">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Project Showcase</h2>
            {/* Add showcase content */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Blueprint2025; 
import React, { useEffect, useState } from "react";
import EditIcon from "../../../public/assets/icons/pencil_icon.svg";
import * as Separator from "@radix-ui/react-separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TextIcon from "@/components/ProfilePage/TextIcon";
import { ProfileField, ProfileRow } from "@/components/ProfilePage/ProfileRow";
import MemberIcon from "../../../public/assets/icons/member_status_icon.svg";
import NonMemberIcon from "../../../public/assets/icons/non-member_status_icon.svg";
import ExecIcon from "../../../public/assets/icons/exec_status_icon.svg";
import { MemberStatus } from "@/types";
import RegisteredIcon from "../../../public/assets/icons/registered_events_icon.svg";
import SavedIcon from "../../../public/assets/icons/bookmark_icon.svg";
import EventCard from "@/components/ProfilePage/EventCard";
import Bizbot from "../../../public/assets/bizbot_peeking.svg";
import Image from "next/image";
import Link from "next/link";

const renderStatusIcon = (status: MemberStatus) => {
  switch (status) {
    case MemberStatus.Member:
      return MemberIcon;
    case MemberStatus.BizTechExec:
      return ExecIcon;
    default:
      return NonMemberIcon;
  }
};

const fetchEventData = async () => {
  let data = [];
  for (let i = 0; i < 10; i++) {
    data.push({
      id: "existingEvent1",
      year: 2020,
      capac: 123,
      createdAt: 1581227718674,
      description: "I am a description",
      elocation: "UBC",
      ename: "cool event",
      startDate: "2024-07-01T07:00:11.131Z",
      endDate: "2024-07-01T21:00:11.131Z",
      imageUrl: "https://i.picsum.photos/id/236/700/400.jpg",
      updatedAt: 1581227718674,
    });
  }
  return data;
};

const ProfilePage = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const memberStatus = MemberStatus.Member; // TO DO: change to value fetched from db

  useEffect(() => {
    const fetchData = async () => {
      const events = await fetchEventData();
      setRegisteredEvents(events);
      setSavedEvents(events);
    };
    fetchData();
  }, []);

  return (
    <main className="bg-primary-color min-h-screen">
      <div className="container mx-auto p-10 pt-24">
        <h3 className="text-white">Welcome back, John!</h3>
        <div style={{ display: "flex", gap: "24px", marginTop: "24px" }}>
          <div
            style={{
              backgroundColor: "#1E2B4D",
              width: "45%",
              borderRadius: "4px",
              display: "flex",
              gap: "24px",
              padding: "24px",
            }}
          >
            <div>
              <Avatar style={{ height: "96px", width: "96px" }}>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p
                style={{
                  textAlign: "center",
                  color: "#B2C9FC",
                  marginTop: "8px",
                }}
              >
                Edit
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <TextIcon
                text={<h4 className="text-biztech-green">User Profile</h4>}
                icon={EditIcon}
                iconSize={28}
                iconAtEnd={true}
              />
              <Separator.Root
                className="SeparatorRoot"
                style={{
                  margin: "12px 0",
                  backgroundColor: "#394971",
                  height: "0.5px",
                }}
              />
              <ProfileRow>
                <ProfileField field="Name" value="John Smith" />
                <ProfileField field="Pronouns" value="They/Them/Their" />
              </ProfileRow>
              <ProfileRow>
                <ProfileField field="School" value="UBC" />
                <ProfileField field="Student Number" value="12345678" />
              </ProfileRow>
              <ProfileRow>
                <ProfileField field="Year of Study" value="3rd" />
                <ProfileField field="Dietary Restrictions" value="None" />
              </ProfileRow>
              <ProfileRow>
                <ProfileField field="Faculty" value="Commerce" />
                <ProfileField field="Major" value="BTM" />
              </ProfileRow>
              <Separator.Root
                className="SeparatorRoot"
                style={{
                  margin: "8px 0",
                  backgroundColor: "#394971",
                  height: "0.5px",
                }}
              />
              <ProfileField
                className="mt-3 mb-3"
                field="Email"
                value="biztechuser@gmail.com"
              />
              <div
                style={{
                  width: "50%",
                  color: "white",
                  marginTop: "12px",
                  marginBottom: "12px",
                }}
              >
                <h6 style={{ color: "#B2C9FC", fontSize: "16px" }}>
                  Membership Status
                </h6>
                <TextIcon
                  text={<p style={{ fontSize: "14px" }}>{memberStatus}</p>}
                  icon={renderStatusIcon(memberStatus)}
                  iconSize={16}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: "55%",
              backgroundColor: "#1E2B4D",
              borderRadius: "4px",
              padding: "24px",
            }}
          >
            <Image
              src={Bizbot}
              alt="BizBot"
              style={{
                position: "absolute",
                top: "-150px", // Adjust as needed
                right: "-10px", // Adjust as needed
                height: "150px",
                zIndex: 10, // Ensure it appears above the div content
              }}
            />
            <h4 className="text-biztech-green">Your Events</h4>
            <Separator.Root
              className="SeparatorRoot"
              style={{
                margin: "12px 0",
                backgroundColor: "#394971",
                height: "0.5px",
              }}
            />
            <TextIcon
              className="mb-4"
              text={<h5 style={{ color: "white" }}>Registered</h5>}
              icon={RegisteredIcon}
              iconSize={24}
            />
            <div style={{ display: "flex", gap: "24px" }}>
              {registeredEvents.slice(-3).map((event) => (
                <EventCard initialData={event} key={event.id} />
              ))}
            </div>
            <TextIcon
              className="my-4"
              text={<h5 style={{ color: "white" }}>Saved</h5>}
              icon={SavedIcon}
              iconSize={24}
            />
            <div style={{ display: "flex", gap: "24px" }}>
              {savedEvents.slice(-3).map((event) => (
                <EventCard initialData={event} key={event.id} />
              ))}
            </div>
            <Separator.Root
              className="SeparatorRoot"
              style={{
                margin: "24px 0",
                backgroundColor: "#394971",
                height: "0.5px",
              }}
            />
            <Link href="">
              <p
                style={{
                  color: "white",
                  textDecoration: "underline",
                  textAlign: "right",
                }}
              >
                View all
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;

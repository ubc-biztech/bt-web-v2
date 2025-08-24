import React from "react";
import { DataTable } from "@/components/RegistrationTable/data-table";
import { createColumns } from "@/components/RegistrationTable/columns";
import { Registration } from "@/types/types";

// Mock data for demonstration
const mockRegistrations: Registration[] = [
  {
    "eventID;year": "demo-event;2025",
    id: "user1@example.com",
    applicationStatus: "Accepted",
    registrationStatus: "Registered",
    basicInformation: {
      fname: "John",
      lname: "Doe",
      faculty: "Engineering",
      year: "3rd Year",
      major: "Computer Science",
      gender: "He/Him",
      diet: "None",
      heardFrom: "Social Media",
    },
    checkoutLink: "",
    dynamicResponses: {},
    fname: "John",
    isPartner: false,
    points: 150,
    scannedQRs: [],
    studentId: "123456789",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
  {
    "eventID;year": "demo-event;2025",
    id: "user2@example.com",
    applicationStatus: "Accepted",
    registrationStatus: "Registered",
    basicInformation: {
      fname: "Jane",
      lname: "Smith",
      faculty: "Business",
      year: "2nd Year",
      major: "Marketing",
      gender: "She/Her",
      diet: "Vegetarian",
      heardFrom: "Friend",
    },
    checkoutLink: "",
    dynamicResponses: {},
    fname: "Jane",
    isPartner: false,
    points: 75,
    scannedQRs: [],
    studentId: "987654321",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
  {
    "eventID;year": "demo-event;2025",
    id: "user3@example.com",
    applicationStatus: "Accepted",
    registrationStatus: "Registered",
    basicInformation: {
      fname: "Bob",
      lname: "Johnson",
      faculty: "Arts",
      year: "4th Year",
      major: "Design",
      gender: "They/Them",
      diet: "Vegan",
      heardFrom: "Email",
    },
    checkoutLink: "",
    dynamicResponses: {},
    fname: "Bob",
    isPartner: false,
    points: 200,
    scannedQRs: [],
    studentId: "456789123",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  },
];

const mockEventData = {
  id: "demo-event",
  year: 2025,
  capac: 100,
  createdAt: Date.now(),
  description: "Demo event for NFC card column testing",
  elocation: "Demo Location",
  ename: "Demo Event",
  startDate: "2025-03-15",
  endDate: "2025-03-16",
  imageUrl: "",
  updatedAt: Date.now(),
  isPublished: true,
  latitude: 0,
  longitude: 0,
  facebookUrl: "",
  deadline: "2025-03-10",
  registrationStatus: "active",
  registrationQuestions: [],
  pricing: {},
  partnerRegistrationQuestions: [],
  feedback: "",
  partnerDescription: "",
  isApplicationBased: false,
  isCompleted: false,
  hasDomainSpecificQuestions: false,
  counts: {},
};

export default function NFCDemo() {
  const refreshTable = async () => {
    console.log("Table refreshed");
  };

  return (
    <main className="bg-bt-blue-600 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            NFC Card Column Demo
          </h1>
          <p className="text-gray-600 mb-4">
            This page demonstrates the new NFC Card column in the event
            registration table.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How it works:
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Case 1:</strong> If your device doesn't support
                      NFC writing, you'll see "Needs Card ⚑" for users who need
                      membership cards
                    </li>
                    <li>
                      <strong>Case 2:</strong> If your device supports NFC
                      writing, you'll see a "Write to Card" button for users who
                      need membership cards
                    </li>
                    <li>
                      Users who already have cards or don't need cards will show
                      "-" in the column
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <DataTable
            initialData={mockRegistrations}
            eventData={mockEventData}
            dynamicColumns={[]}
            eventId="demo-event"
            year="2025"
          />
        </div>
      </div>
    </main>
  );
}

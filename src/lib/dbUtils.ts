import { fetchBackend } from "./db";
import { DBRegistrationStatus, ApplicationStatus } from '@/types';

export async function fetchRegistrationData(eventId: string, year: string) {
    // TODO - fetch data registration data from backend. This is just returning a Mock, likely won't be the final data struct format

    let data = []
    for (let i = 0; i < 200; i++) {
        data.push({
            id: i.toString(),
            regStatus: "Checked-In",
            appStatus: "Accepted",
            firstName: "John",
            lastName: "Smith",
            email: "testing@ubcbiztech.com",
            points: 0,
            studentNumber: "12345678",
            faculty: "Comm...",
            dynamicField1: "aa...",
            shouldNotDisplay: "THIS SHOULD NOT BE DISPLAYING."
        })
    }

    return data
}

// Helper to convert UI registration status to DB format
export function convertRegistrationStatusToDB(uiStatus: string): string {
    switch (uiStatus.toLowerCase()) {
        case 'registered':
            return DBRegistrationStatus.REGISTERED;
        case 'checked-in':
            return DBRegistrationStatus.CHECKED_IN;
        case 'cancelled':
            return DBRegistrationStatus.CANCELLED;
        case 'incomplete':
            return DBRegistrationStatus.INCOMPLETE;
        case 'waitlisted':
            return DBRegistrationStatus.WAITLISTED;
        default:
            return uiStatus.toLowerCase();
    }
}

// Helper to prepare update payload
export function prepareUpdatePayload(column: string, value: any, eventId: string, year: string) {
    const basePayload = {
        eventID: eventId,
        year: parseInt(year),
    };

    if (column === 'registrationStatus') {
        return {
            ...basePayload,
            [column]: convertRegistrationStatusToDB(value as string),
        };
    }

    if (column === 'points') {
        return {
            ...basePayload,
            [column]: parseInt(value as string),
        };
    }

    return {
        ...basePayload,
        [column]: value,
    };
}

export async function updateRegistrationData(email: string, fname: string, body: any) {
    console.log("Updating registration data", body);
    try {
        await fetchBackend({ endpoint: `/registrations/${email}/${fname}`, method: "PUT", authenticatedCall: false, 
            data: body });
    } catch (e) {
        console.error("Internal Server Error, Update Failed");
    }
}
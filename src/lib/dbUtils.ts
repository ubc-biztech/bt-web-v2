import { DBRegistrationStatus } from "@/types"; 
export async function fetchRegistrationData(eventId: string, year: string) {
    // TODO - fetch data registration data from backend. This is just returning a Mock, likely won't be the final data struct format

    let data = []
    for (let i = 0; i < 200; i++) {
        data.push({
            id: i.toString(),
            applicationStatus: getRandomValue(["Accepted", "Reviewing", "Waitlist", "Rejected"]).toString(),
            registrationStatus: getRandomValue(Object.values(DBRegistrationStatus)).toString(),
            basicInformation: {
              diet: getRandomValue(["None", "Gluten Free", "Halal", "Vegetarian", "Vegan"]).toString(),
              faculty: getRandomValue(["Arts", "Commerce", "Engineering", "Forestry", "Science", "Other"]).toString(),
              fname: "John",
              gender: getRandomValue([["They/Them/Their"], ["She/Her/Hers"], ["Other/Prefer not to say"], ["He/Him/His"]].flat()).toString(),
              heardFrom: getRandomValue(["Facebook", "Instagram", "Biztech Newsletter", "LinkedIn", "Biztech Boothing", "Friends/Word of Mouth", "Other"]).toString(),
              lname: "Smith",
              major: "",
              year: getRandomValue(["1st year", "2nd year", "3rd year", "4th year", "5+ year", "Other"]).toString(),
            },
            checkoutLink: "",
            dynamicResponses: {},
            fname: "John",
            isPartner: false,
            points: 0,
            studentId: 12345678,
            scannedQRs: [],
            updatedAt: new Date().toString(),
          })
    }
    return data
}

function getRandomValue(field: String[]) {
    return field[Math.floor(Math.random() * field.length)];
}
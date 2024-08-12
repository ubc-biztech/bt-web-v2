export async function fetchRegistrationData(eventId: string, year: string) {
    // TODO - fetch data registration data from backend. This is just returning a Mock, likely won't be the final data struct format

    let data = []
    for (let i = 0; i < 200; i++) {
        data.push({
            id: i.toString(),
            applicationStatus: getRandomValue(["accepted", "reviewing", "waitlist"]),
            registrationStatus: getRandomValue(["registered", "checkedIn", "waitlist", "incomplete", "cancelled"]),
            basicInfo: {
                diet: getRandomValue(["None", "Gluten Free", "Halal", "Vegetarian", "Vegan"]),
                faculty: getRandomValue(["Arts", "Commerce", "Engineering", "Foresty", "Science", "Other"]),
                fname: "John",
                gender: getRandomValue([["They/Them/Their"], ["She/Her/Hers"], ["Other/Prefer not to say"], ["He/Him/His"]].flat()),
                heardFrom: getRandomValue(["Facebook", "Instagram", "Biztech Newsletter", "LinkedIn", "Biztech Boothing", "Friends/Word of Mouth", "Other"]),
                lname: "Smith",
                major: "",
                year: getRandomValue(["1st year", "2nd year", "3rd year", "4th year", "5+ year", "Other"])
            },
            checkoutLink: "",
            dynamicResponses: {},
            fname: "John",
            isPartner: "false",
            poinsts: 0,
            scannedQRs: [],
            updatedAt: new Date().toString(),
        })
    }
    return data
}

function getRandomValue(field: String[]) {
    return field[Math.floor(Math.random() * field.length)];
}
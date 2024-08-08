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
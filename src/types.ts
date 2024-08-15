export type UserEventData = {
    id: string,
    applicationStatus: string,
    registrationStatus: string,
    basicInfo: {
        diet: string,
        faculty: string,
        fname: string,
        gender: string,
        heardFrom: string,
        lname: string,
        major: string,
        year: string,
    },
    checkoutLink: string,
    dynamicResponses: {[key: string]: string},
    fname: string,
    isPartner: string,
    points: number,
    scannedQRs: string[],
    updatedAt: string,

}

export type StatsChartData = { label: string; value: number };
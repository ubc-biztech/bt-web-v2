export type BasicInformation = {
    fname: string
    lname: string
    major: string
    gender: string
    year: string
    diet: string
    heardFrom: string
    faculty: string
}

export enum MemberStatus {
    Member = "Member",
    NonMember = "Non-member",
    BizTechExec = "BizTech Exec"
}
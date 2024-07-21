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

export type BiztechEvent = {
    id: string;
    year: number;
    capac: number;
    createdAt: number;
    description: string;
    elocation: string;
    ename: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    updatedAt: number;
  };

  export type Profile =  {
      name: string,
      image?: string,
      email: string,
      pronouns: string,
      school: string,
      studentId: string,
      year: string,
      dietary: string,
      faculty: string,
      major: string,
      status: MemberStatus,
  };
import { createContext, useContext } from "react";

export interface Registration {
  id: string;
  fname: string;
  points?: number;
  isPartner?: boolean;
  teamID?: string;
  [key: string]: any;
}

interface UserRegistrationContextType {
  userRegistration: Registration | null;
}

export const UserRegistrationContext =
  createContext<UserRegistrationContextType | null>(null);

export const useUserRegistration = () => {
  const context = useContext(UserRegistrationContext);
  if (!context) {
    throw new Error(
      "useUserRegistration must be used within a UserRegistrationProvider",
    );
  }
  return context;
};

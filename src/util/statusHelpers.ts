import { ApplicationStatus, RegistrationStatus, DBRegistrationStatus } from '../types/types';
import { APPLICATION_STATUS, REGISTRATION_STATUS } from '../constants/registrations';

// APPLICATION STATUS HELPERS (Review Decisions)

export const isAccepted = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.ACCEPTED;
};


export const isRejected = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.REJECTED;
};


export const isWaitlisted = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.WAITLISTED;
};


export const isCheckedIn = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.CHECKED_IN;
};


export const isCancelled = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.CANCELLED;
};


export const isIncomplete = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.INCOMPLETE;
};


export const isRegistered = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.REGISTERED;
};


export const isUnderReview = (applicationStatus: string): boolean => {
  return applicationStatus === ApplicationStatus.REGISTERED;
};

// REGISTRATION STATUS HELPERS (Payment/Completion Lifecycle)


export const needsPayment = (registrationStatus: string): boolean => {
  return registrationStatus === RegistrationStatus.PAYMENTPENDING;
};


export const needsConfirmation = (registrationStatus: string): boolean => {
  return registrationStatus === RegistrationStatus.PENDING;
};


export const isComplete = (registrationStatus: string): boolean => {
  return registrationStatus === RegistrationStatus.COMPLETE;
};


export const isUnderReviewStatus = (registrationStatus: string): boolean => {
  return registrationStatus === RegistrationStatus.REVIEWING;
};

// REGISTRATION FLOW HELPERS

/**
 * Get the appropriate price for a user based on their membership status
 */
export const getUserPrice = (event: any, user: any): number => {
  return user?.isMember ? event.pricing?.members : event.pricing?.nonMembers;
};

/**
 * Check if an event is paid for a specific user
 */
export const isEventPaidForUser = (event: any, user: any): boolean => {
  return getUserPrice(event, user) > 0;
};

/**
 * Get initial statuses for a new registration based on event type and user membership
 */
export const getInitialRegistrationStatuses = (event: any, user: any) => {
  if (event.isApplicationBased) {
    // Application-based events (both free and paid)
    return {
      applicationStatus: ApplicationStatus.REGISTERED,
      registrationStatus: RegistrationStatus.REVIEWING
    };
  } else {
    // Non-application events - check pricing based on user membership
    if (isEventPaidForUser(event, user)) {
      // Paid event
      return {
        applicationStatus: ApplicationStatus.INCOMPLETE,
        registrationStatus: RegistrationStatus.PAYMENTPENDING
      };
    } else {
      // Free event
      return {
        applicationStatus: ApplicationStatus.ACCEPTED,
        registrationStatus: RegistrationStatus.COMPLETE
      };
    }
  }
};


// LEGACY STATUS MAPPING HELPERS

/**
 * Map legacy application status to new ApplicationStatus
 */
export const mapLegacyApplicationStatus = (legacyStatus: string): string => {
  const mapping: Record<string, string> = {
    [DBRegistrationStatus.REGISTERED]: ApplicationStatus.REGISTERED,
    [DBRegistrationStatus.INCOMPLETE]: ApplicationStatus.INCOMPLETE,
    [DBRegistrationStatus.ACCEPTED]: ApplicationStatus.ACCEPTED,
    [DBRegistrationStatus.WAITLISTED]: ApplicationStatus.WAITLISTED,
    [DBRegistrationStatus.CHECKED_IN]: ApplicationStatus.CHECKED_IN,
    [DBRegistrationStatus.CANCELLED]: ApplicationStatus.CANCELLED,
  };
  
  return mapping[legacyStatus] || legacyStatus;
};

/**
 * Map legacy registration status to new RegistrationStatus
 */
export const mapLegacyRegistrationStatus = (legacyStatus: string): string => {
  const mapping: Record<string, string> = {
    [DBRegistrationStatus.REGISTERED]: RegistrationStatus.REVIEWING,
    [DBRegistrationStatus.INCOMPLETE]: RegistrationStatus.REVIEWING,
    [DBRegistrationStatus.ACCEPTED]: RegistrationStatus.PENDING,
    [DBRegistrationStatus.ACCEPTED_PENDING]: RegistrationStatus.PENDING,
    [DBRegistrationStatus.ACCEPTED_COMPLETE]: RegistrationStatus.COMPLETE,
    [DBRegistrationStatus.WAITLISTED]: RegistrationStatus.REVIEWING,
    [DBRegistrationStatus.CHECKED_IN]: RegistrationStatus.COMPLETE,
    [DBRegistrationStatus.CANCELLED]: RegistrationStatus.REVIEWING,
  };
  
  return mapping[legacyStatus] || legacyStatus;
};

/**
 * Check if a status is a legacy status that needs mapping
 */
export const isLegacyStatus = (status: string): boolean => {
  const legacyStatuses = Object.values(DBRegistrationStatus);
  return legacyStatuses.includes(status as DBRegistrationStatus);
};


// /**
//  * Get the appropriate status message for display
//  */
// export const getStatusMessage = (applicationStatus: string, registrationStatus: string): string => {
//   if (shouldShowPaymentUI(applicationStatus, registrationStatus)) {
//     return "Your application has been accepted! Please complete payment to confirm your attendance.";
//   }
  
//   if (shouldShowConfirmationUI(applicationStatus, registrationStatus)) {
//     return "Your application has been accepted! Please confirm your attendance.";
//   }
  
//   if (shouldShowReviewUI(applicationStatus, registrationStatus)) {
//     return "Your application is under review. We'll notify you once a decision has been made.";
//   }
  
//   if (shouldShowWaitlistUI(applicationStatus, registrationStatus)) {
//     return "You're on the waitlist. We'll notify you if a spot becomes available.";
//   }
  
//   if (shouldShowRejectionUI(applicationStatus, registrationStatus)) {
//     return "Unfortunately, your application was not accepted for this event.";
//   }
  
//   if (shouldShowSuccessUI(applicationStatus, registrationStatus)) {
//     return "You're all set! Your registration is complete.";
//   }
  
//   return "Status unknown. Please contact support if you have any questions.";
// };

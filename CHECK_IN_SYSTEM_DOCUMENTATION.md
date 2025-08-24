# Event Check-in System Documentation

This document outlines all the points in the application where participants can be checked into events.

## Overview

The app provides multiple check-in mechanisms to accommodate different scenarios and user needs:

1. **QR Code Check-in** - Primary automated check-in system
2. **Manual Check-in** - Administrative override through the registration table
3. **Companion App Check-in** - Special interaction tracking system

## 1. QR Code Check-in System

### Main Component: `src/components/QrScanner/QrScanner.tsx`

**Purpose**: Primary method for checking in event participants using QR codes

**Process Flow**:
1. **QR Code Format**: `email;event_id;year;first_name`
2. **Validation**: Checks if participant is registered for the event
3. **Status Check**: Prevents duplicate check-ins and validates eligibility
4. **API Update**: Calls `/registrations/{id}/{fname}` PUT endpoint
5. **Status Change**: Updates `registrationStatus` to `"checkedIn"`

**Integration**: Embedded in the registration table (`src/components/RegistrationTable/data-table.tsx`)

**Key Features**:
- Camera controls (front/back switching)
- Real-time validation feedback
- Prevents check-ins for cancelled/waitlisted registrations
- Visual status indicators (success/failure/scanning)

## 2. Manual Check-in System

### Primary Interface: Registration Table

**Location**: `src/components/RegistrationTable/`

**Components**:
- `TableCell.tsx` - Inline status editing
- `EditCell.tsx` - Detailed participant editing popup
- `userPopupEdit.tsx` - Status dropdown selection

**Process**:
1. **Status Column**: Dropdown with options including "Checked-In"
2. **Direct Editing**: Click on registration status to change
3. **API Update**: Same endpoint as QR system (`/registrations/{id}/{fname}`)
4. **Real-time Refresh**: Table updates immediately after changes

**Use Cases**:
- Participants without QR codes
- Status corrections
- Bulk status updates
- Administrative overrides

## 3. Companion App Check-in System

### Location: `src/pages/companion/scan/[qrId]/index.tsx`

**Purpose**: Tracks participant interactions and engagement, not just attendance

**Supported Check-in Types**:
- `NFC_ATTENDEE` - Attendee-to-attendee connections
- `NFC_PARTNER` - Partner interactions  
- `NFC_EXEC` - Executive interactions
- `NFC_COMPANY` - Company booth visits
- `NFC_BOOTH` - Booth interactions
- `NFC_WORKSHOP` - Workshop participation

**Process**:
1. **QR/NFC Scan**: Reads interaction codes
2. **Interaction Logging**: Posts to `/interactions` endpoint
3. **Profile Integration**: Redirects to relevant profile pages

## 4. Registration Status Constants

### Location: `src/constants/registrations.ts`

**Key Status Values**:
- `REGISTERED` - Participant has registered but not checked in
- `CHECKED_IN` - Participant has been successfully checked into the event
- `WAITLISTED` - Participant is on waitlist (cannot check in)
- `CANCELLED` - Registration cancelled (cannot check in)
- `INCOMPLETE` - Registration incomplete (cannot check in)

## 5. Database Integration

### API Endpoints

**Check-in Updates**:
- `PUT /registrations/{id}/{fname}` - Updates registration status

**Data Fetching**:
- `GET /registrations?eventID={id}&year={year}` - Retrieves event registrations

### Status Conversion

**Location**: `src/lib/dbUtils.ts`

**Functions**:
- `convertRegistrationStatusToDB()` - Converts UI labels to database values
- `prepareUpdatePayload()` - Prepares update requests

## 6. User Experience Flow

### For Event Organizers

1. **Open Registration Table**: Access event registrations
2. **Toggle QR Scanner**: Enable camera-based check-ins
3. **Scan QR Codes**: Automated participant check-ins
4. **Manual Overrides**: Edit statuses directly in table
5. **Real-time Updates**: See changes immediately

### For Participants

1. **Receive QR Code**: Get event-specific QR code
2. **Arrive at Event**: Present QR code for scanning
3. **Instant Check-in**: Status updated immediately
4. **Confirmation**: Visual feedback on check-in success

## 7. Security & Validation

### QR Code Validation
- Event ID and year matching
- Participant registration verification
- Duplicate check-in prevention
- Status eligibility checks

### Manual Check-in Controls
- Administrative access required
- Audit trail through API calls
- Real-time validation
- Status constraint enforcement

## 8. Technical Implementation

### Key Technologies
- **QR Scanning**: `react-qr-reader` library
- **Camera Control**: Browser MediaDevices API
- **State Management**: React hooks and context
- **API Integration**: Custom `fetchBackend` utility
- **UI Components**: Custom components with shadcn/ui

### Performance Considerations
- Scan delay: 250ms between scans
- Auto-reset: 8 seconds after success/failure
- Real-time updates: Immediate table refresh
- Camera optimization: Configurable facing modes

## Summary

The check-in system provides a comprehensive solution for event management with:
- **Automated QR scanning** for efficient participant processing
- **Manual administrative controls** for edge cases and overrides
- **Companion app integration** for enhanced participant engagement
- **Real-time status updates** across all interfaces
- **Robust validation** to prevent errors and duplicates

This multi-faceted approach ensures reliable event check-ins while maintaining flexibility for different use cases and user preferences. 
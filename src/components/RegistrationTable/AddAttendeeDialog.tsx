import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";
import { EMAIL_REGEX } from "@/constants/registrations";
import { DBRegistrationStatus } from "@/types";
import { ApplicationStatus } from "@/types";

interface AddAttendeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  year: string;
  refreshTable: () => Promise<void>;
}

export const AddAttendeeDialog: React.FC<AddAttendeeDialogProps> = ({
  open,
  onOpenChange,
  eventId,
  year,
  refreshTable,
}) => {
  const { toast } = useToast();
  const [addEmail, setAddEmail] = useState("");
  const [addFname, setAddFname] = useState("");
  const [addLname, setAddLname] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);

  const handleAddAttendee = async () => {
    const email = addEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setAddError("A valid email is required.");
      return;
    }
    if (!addFname.trim()) {
      setAddError("First name is required.");
      return;
    }
    setIsAddSubmitting(true);
    setAddError(null);
    try {
      await fetchBackend({
        endpoint: "/registrations",
        method: "POST",
        data: {
          email,
          fname: addFname.trim(),
          basicInformation: {
            fname: addFname.trim(),
            ...(addLname.trim() && { lname: addLname.trim() }),
          },
          eventID: eventId,
          year: Number(year),
          registrationStatus: DBRegistrationStatus.REGISTERED,
          applicationStatus: ApplicationStatus.REVIEWING,
        },
        authenticatedCall: true,
      });
      onOpenChange(false);
      setAddEmail("");
      setAddFname("");
      setAddLname("");
      await refreshTable();
      toast({
        title: "Attendee added",
        description: `${email} has been registered.`,
      });
    } catch (err: any) {
      const message = err?.message?.message || err?.message;
      setAddError(
        typeof message === "string" ? message : "Failed to add attendee.",
      );
    } finally {
      setIsAddSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setAddError(null);
          setAddEmail("");
          setAddFname("");
          setAddLname("");
        }
      }}
    >
      <DialogContent className="max-w-md w-full bg-bt-blue-400">
        <DialogHeader>
          <DialogTitle className="text-white">Add Attendee</DialogTitle>
        </DialogHeader>

        <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

        <div className="space-y-4">
          {addError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
              {addError}
            </div>
          )}
          <div>
            <Label htmlFor="addEmail" className="text-white">
              Email *
            </Label>
            <Input
              id="addEmail"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="attendee@example.com"
              className="bg-bt-blue-400 text-white border-[#8DA1D1]"
            />
          </div>
          <div>
            <Label htmlFor="addFname" className="text-white">
              First Name *
            </Label>
            <Input
              id="addFname"
              value={addFname}
              onChange={(e) => setAddFname(e.target.value)}
              placeholder="First name"
              className="bg-bt-blue-400 text-white border-[#8DA1D1]"
            />
          </div>
          <div>
            <Label htmlFor="addLname" className="text-white">
              Last Name
            </Label>
            <Input
              id="addLname"
              value={addLname}
              onChange={(e) => setAddLname(e.target.value)}
              placeholder="Last name (optional)"
              className="bg-bt-blue-400 text-white border-[#8DA1D1]"
            />
          </div>
        </div>

        <div className="w-full h-[1px] bg-[#8DA1D1] my-3" />

        <Button
          onClick={handleAddAttendee}
          className="text-bt-blue-400 bg-bt-green-300"
          disabled={isAddSubmitting}
        >
          {isAddSubmitting ? "Adding..." : "Add Attendee"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

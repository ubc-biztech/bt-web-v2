import type { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type {
  EventOption,
  PartnerCommunicationFormState,
  PartnerDocumentFormState,
  PartnerFormState,
  PartnerLinkFormState,
  PartnerSummary,
  PartnershipEventFormState,
  TierConfig,
} from "./partnershipsPageTypes";

type SelectOption = {
  value: string;
  label: string;
};

type PartnershipsDialogsProps = {
  customStatusValue: string;
  customTierValue: string;
  roleSuggestions: string[];
  formatCurrency: (value: number | null | undefined) => string;
  toTierLabel: (value: string) => string;
  getContactDisplayName: (value?: string | null) => string;

  isPartnerModalOpen: boolean;
  setIsPartnerModalOpen: (open: boolean) => void;
  partnerModalMode: "create" | "edit";
  partnerForm: PartnerFormState;
  setPartnerForm: Dispatch<SetStateAction<PartnerFormState>>;
  submitPartner: () => Promise<void> | void;
  isSavingPartner: boolean;

  isEventModalOpen: boolean;
  setIsEventModalOpen: (open: boolean) => void;
  eventModalMode: "create" | "edit";
  eventForm: PartnershipEventFormState;
  setEventForm: Dispatch<SetStateAction<PartnershipEventFormState>>;
  addTierRow: () => void;
  updateTierRow: (
    rowId: string,
    field: "label" | "amount",
    value: string,
  ) => void;
  removeTierRow: (rowId: string) => void;
  submitEvent: () => Promise<void> | void;
  isSavingEvent: boolean;

  isLinkModalOpen: boolean;
  setIsLinkModalOpen: (open: boolean) => void;
  linkModalMode: "create" | "edit";
  linkForm: PartnerLinkFormState;
  setLinkForm: Dispatch<SetStateAction<PartnerLinkFormState>>;
  linkStatusSelectValue: string;
  partnerLinkStatusOptions: SelectOption[];
  linkTierSelectValue: string;
  selectedLinkEventTierConfigs: TierConfig[];
  partners: PartnerSummary[];
  events: EventOption[];
  applyTierDefaultAmount: (eventId: string, tierId: string) => void;
  submitLink: () => Promise<void> | void;
  isSavingLink: boolean;

  isDocumentModalOpen: boolean;
  setIsDocumentModalOpen: (open: boolean) => void;
  documentModalMode: "create" | "edit";
  documentForm: PartnerDocumentFormState;
  setDocumentForm: Dispatch<SetStateAction<PartnerDocumentFormState>>;
  submitDocument: () => Promise<void> | void;
  isSavingDocument: boolean;

  isCommunicationModalOpen: boolean;
  setIsCommunicationModalOpen: (open: boolean) => void;
  communicationModalMode: "create" | "edit";
  communicationForm: PartnerCommunicationFormState;
  setCommunicationForm: Dispatch<SetStateAction<PartnerCommunicationFormState>>;
  submitCommunication: () => Promise<void> | void;
  isSavingCommunication: boolean;
};

export function PartnershipsDialogs({
  customStatusValue,
  customTierValue,
  roleSuggestions,
  formatCurrency,
  toTierLabel,
  getContactDisplayName,
  isPartnerModalOpen,
  setIsPartnerModalOpen,
  partnerModalMode,
  partnerForm,
  setPartnerForm,
  submitPartner,
  isSavingPartner,
  isEventModalOpen,
  setIsEventModalOpen,
  eventModalMode,
  eventForm,
  setEventForm,
  addTierRow,
  updateTierRow,
  removeTierRow,
  submitEvent,
  isSavingEvent,
  isLinkModalOpen,
  setIsLinkModalOpen,
  linkModalMode,
  linkForm,
  setLinkForm,
  linkStatusSelectValue,
  partnerLinkStatusOptions,
  linkTierSelectValue,
  selectedLinkEventTierConfigs,
  partners,
  events,
  applyTierDefaultAmount,
  submitLink,
  isSavingLink,
  isDocumentModalOpen,
  setIsDocumentModalOpen,
  documentModalMode,
  documentForm,
  setDocumentForm,
  submitDocument,
  isSavingDocument,
  isCommunicationModalOpen,
  setIsCommunicationModalOpen,
  communicationModalMode,
  communicationForm,
  setCommunicationForm,
  submitCommunication,
  isSavingCommunication,
}: PartnershipsDialogsProps) {
  return (
    <>
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-bt-blue-300 bg-bt-blue-500 text-white sm:max-w-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {partnerModalMode === "create" ? "Add Partner" : "Edit Partner"}
            </h3>
            <p className="text-sm text-bt-blue-100">
              Store contact and relationship context for this partner.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Company</label>
              <Input
                value={partnerForm.company}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    company: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Company name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">
                Primary Contact
              </label>
              <Input
                value={partnerForm.contactName}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    contactName: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Contact full name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Contact Role</label>
              <Input
                value={partnerForm.contactRole}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    contactRole: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Partnerships Manager"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Email</label>
              <Input
                value={partnerForm.email}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Phone</label>
              <Input
                value={partnerForm.phone}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    phone: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Partner Tier</label>
              <Input
                value={partnerForm.tier}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    tier: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Strategic, startup, etc"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">LinkedIn</label>
              <Input
                value={partnerForm.linkedin}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    linkedin: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="URL"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Tags</label>
              <Input
                value={partnerForm.tagsInput}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    tagsInput: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="mentor, sponsor, food, alumni (comma separated)"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Notes</label>
              <Textarea
                value={partnerForm.notes}
                onChange={(event) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                className="min-h-[90px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Freeform context and relationship notes"
              />
            </div>

            <label className="flex items-center gap-2 rounded-md border border-bt-blue-300/40 bg-bt-blue-600/50 px-3 py-2 text-sm text-bt-blue-100 sm:col-span-2">
              <Checkbox
                checked={partnerForm.isAlumni}
                onCheckedChange={(checked) =>
                  setPartnerForm((previous) => ({
                    ...previous,
                    isAlumni: Boolean(checked),
                  }))
                }
                className="border-bt-blue-200"
              />
              Mark as BizTech alumni partner
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-bt-blue-300/50 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPartnerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={() => void submitPartner()}
              disabled={isSavingPartner}
            >
              {isSavingPartner ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {partnerModalMode === "create"
                ? "Create Partner"
                : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-bt-blue-300 bg-bt-blue-500 text-white sm:max-w-3xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {eventModalMode === "create"
                ? "Create CRM Event"
                : "Edit CRM Event"}
            </h3>
            <p className="text-sm text-bt-blue-100">
              Configure event timeline, goals, and tier presets with default
              amounts.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Event Name</label>
              <Input
                value={eventForm.name}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Blueprint, Hello Hacks, etc"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Year</label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={eventForm.year}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    year: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">
                Sponsorship Goal (CAD)
              </label>
              <Input
                type="number"
                min={0}
                value={eventForm.sponsorshipGoal}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    sponsorshipGoal: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Outreach Start</label>
              <Input
                type="date"
                value={eventForm.outreachStartDate}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    outreachStartDate: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Event Start</label>
              <Input
                type="date"
                value={eventForm.startDate}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    startDate: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Event End</label>
              <Input
                type="date"
                value={eventForm.endDate}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    endDate: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Notes</label>
              <Textarea
                value={eventForm.notes}
                onChange={(event) =>
                  setEventForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                className="min-h-[90px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Internal planning notes"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-bt-blue-100">Tier Presets</label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                  onClick={addTierRow}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Tier
                </Button>
              </div>

              <div className="space-y-2 rounded-md border border-bt-blue-300/40 bg-bt-blue-600/30 p-3">
                {eventForm.tierRows.map((row) => (
                  <div
                    key={row.localId}
                    className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto]"
                  >
                    <Input
                      value={row.label}
                      onChange={(event) =>
                        updateTierRow(row.localId, "label", event.target.value)
                      }
                      className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                      placeholder="Tier label (e.g. Gold Sponsor)"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={row.amount}
                      onChange={(event) =>
                        updateTierRow(row.localId, "amount", event.target.value)
                      }
                      className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                      placeholder="Amount"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 self-center text-bt-red-100 hover:bg-bt-red-300/20 hover:text-bt-red-100"
                      onClick={() => removeTierRow(row.localId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-md border border-bt-blue-300/40 bg-bt-blue-600/50 px-3 py-2 text-sm text-bt-blue-100 sm:col-span-2">
              <Checkbox
                checked={eventForm.archived}
                onCheckedChange={(checked) =>
                  setEventForm((previous) => ({
                    ...previous,
                    archived: Boolean(checked),
                  }))
                }
                className="border-bt-blue-200"
              />
              Archive this CRM event
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-bt-blue-300/50 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={() => void submitEvent()}
              disabled={isSavingEvent}
            >
              {isSavingEvent ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {eventModalMode === "create" ? "Create Event" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-bt-blue-300 bg-bt-blue-500 text-white sm:max-w-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {linkModalMode === "create"
                ? "Link Partner to Event"
                : "Edit Event Involvement"}
            </h3>
            <p className="text-sm text-bt-blue-100">
              Assign status, involvement type, tier, and amount with
              event-specific tier presets.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Partner</label>
              <Select
                value={linkForm.partnerId || "none"}
                onValueChange={(value) =>
                  setLinkForm((previous) => ({
                    ...previous,
                    partnerId: value === "none" ? "" : value,
                  }))
                }
                disabled={linkModalMode === "edit"}
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select partner</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {getContactDisplayName(partner.contactName)} •{" "}
                      {partner.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">CRM Event</label>
              <Select
                value={linkForm.eventId || "none"}
                onValueChange={(value) => {
                  const nextEventId = value === "none" ? "" : value;
                  setLinkForm((previous) => ({
                    ...previous,
                    eventId: nextEventId,
                    packageTier: "",
                    customTier: "",
                  }));
                }}
                disabled={linkModalMode === "edit"}
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Status</label>
              <Select
                value={linkStatusSelectValue}
                onValueChange={(value) => {
                  if (value === customStatusValue) {
                    setLinkForm((previous) => ({
                      ...previous,
                      status: customStatusValue,
                    }));
                    return;
                  }

                  setLinkForm((previous) => ({
                    ...previous,
                    status: value,
                    customStatus: "",
                  }));
                }}
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {partnerLinkStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {linkStatusSelectValue === customStatusValue ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-bt-blue-100">
                  Custom Status
                </label>
                <Input
                  value={linkForm.customStatus}
                  onChange={(event) =>
                    setLinkForm((previous) => ({
                      ...previous,
                      customStatus: event.target.value,
                    }))
                  }
                  className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                  placeholder="e.g. waiting_contract"
                />
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Tier</label>
              <Select
                value={linkTierSelectValue}
                onValueChange={(value) => {
                  if (value === "none") {
                    setLinkForm((previous) => ({
                      ...previous,
                      packageTier: "",
                      customTier: "",
                    }));
                    return;
                  }

                  if (value === customTierValue) {
                    setLinkForm((previous) => ({
                      ...previous,
                      packageTier: "",
                    }));
                    return;
                  }

                  setLinkForm((previous) => ({
                    ...previous,
                    packageTier: value,
                    customTier: "",
                  }));
                  applyTierDefaultAmount(linkForm.eventId, value);
                }}
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tier</SelectItem>
                  {selectedLinkEventTierConfigs.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.label || toTierLabel(tier.id)}
                      {tier.amount !== null
                        ? ` (${formatCurrency(tier.amount)})`
                        : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value={customTierValue}>Custom tier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Amount (CAD)</label>
              <Input
                type="number"
                min={0}
                value={linkForm.amount}
                onChange={(event) =>
                  setLinkForm((previous) => ({
                    ...previous,
                    amount: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Leave blank for tier default"
              />
            </div>

            {linkTierSelectValue === customTierValue ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-bt-blue-100">
                  Custom Tier Name
                </label>
                <Input
                  value={linkForm.customTier}
                  onChange={(event) =>
                    setLinkForm((previous) => ({
                      ...previous,
                      customTier: event.target.value,
                    }))
                  }
                  className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                  placeholder="e.g. snack_partner"
                />
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">
                Involvement Type
              </label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {roleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setLinkForm((previous) => ({
                        ...previous,
                        role: suggestion,
                      }))
                    }
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] transition",
                      linkForm.role === suggestion
                        ? "border-bt-green-300/50 bg-bt-green-300/20 text-bt-green-200"
                        : "border-bt-blue-300/35 bg-bt-blue-600/40 text-bt-blue-100 hover:bg-bt-blue-500/50",
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <Input
                value={linkForm.role}
                onChange={(event) =>
                  setLinkForm((previous) => ({
                    ...previous,
                    role: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Type any involvement (e.g. keynote speaker)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Follow-up Date</label>
              <Input
                type="date"
                value={linkForm.followUpDate}
                onChange={(event) =>
                  setLinkForm((previous) => ({
                    ...previous,
                    followUpDate: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Notes</label>
              <Textarea
                value={linkForm.notes}
                onChange={(event) =>
                  setLinkForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                className="min-h-[90px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Context for this event relationship"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-bt-blue-300/50 pt-4">
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={() => void submitLink()}
              disabled={isSavingLink}
            >
              {isSavingLink ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {linkModalMode === "create" ? "Create Link" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-bt-blue-300 bg-bt-blue-500 text-white sm:max-w-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {documentModalMode === "create"
                ? "Add Document"
                : "Edit Document"}
            </h3>
            <p className="text-sm text-bt-blue-100">
              Link files and references to this partner.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Title</label>
              <Input
                value={documentForm.title}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="MOU, invoice, deck"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Type</label>
              <Input
                value={documentForm.type}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    type: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="mou, invoice, deck"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Status</label>
              <Input
                value={documentForm.status}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    status: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="draft, sent, signed"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">URL</label>
              <Input
                value={documentForm.url}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    url: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">File Name</label>
              <Input
                value={documentForm.fileName}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    fileName: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Related Event</label>
              <Select
                value={documentForm.eventId || "none"}
                onValueChange={(value) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    eventId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Notes</label>
              <Textarea
                value={documentForm.notes}
                onChange={(event) =>
                  setDocumentForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                className="min-h-[90px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-bt-blue-300/50 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDocumentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={() => void submitDocument()}
              disabled={isSavingDocument}
            >
              {isSavingDocument ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {documentModalMode === "create" ? "Add Document" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCommunicationModalOpen}
        onOpenChange={setIsCommunicationModalOpen}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto border-bt-blue-300 bg-bt-blue-500 text-white sm:max-w-2xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              {communicationModalMode === "create"
                ? "Log Communication"
                : "Edit Communication"}
            </h3>
            <p className="text-sm text-bt-blue-100">
              Capture outreach notes and follow-up context.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Subject</label>
              <Input
                value={communicationForm.subject}
                onChange={(event) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    subject: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Summary</label>
              <Textarea
                value={communicationForm.summary}
                onChange={(event) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    summary: event.target.value,
                  }))
                }
                className="min-h-[90px] border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="What happened?"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Channel</label>
              <Input
                value={communicationForm.channel}
                onChange={(event) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    channel: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
                placeholder="email, call, linkedin"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Direction</label>
              <Select
                value={communicationForm.direction}
                onValueChange={(value) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    direction: value as "inbound" | "outbound",
                  }))
                }
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Occurred At</label>
              <Input
                type="datetime-local"
                value={communicationForm.occurredAtLocal}
                onChange={(event) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    occurredAtLocal: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-bt-blue-100">Follow-up Date</label>
              <Input
                type="date"
                value={communicationForm.followUpDate}
                onChange={(event) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    followUpDate: event.target.value,
                  }))
                }
                className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-bt-blue-100">Related Event</label>
              <Select
                value={communicationForm.eventId || "none"}
                onValueChange={(value) =>
                  setCommunicationForm((previous) => ({
                    ...previous,
                    eventId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="border-bt-blue-300/40 bg-bt-blue-600/40 text-white">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-bt-blue-300/50 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCommunicationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={() => void submitCommunication()}
              disabled={isSavingCommunication}
            >
              {isSavingCommunication ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {communicationModalMode === "create" ? "Log" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

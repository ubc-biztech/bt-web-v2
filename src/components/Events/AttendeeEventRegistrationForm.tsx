import React, { useMemo, useState } from "react";
import { Building, Calendar } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  extractTime,
  extractMonthDay,
  shortformatDate,
} from "@/util/extractDate";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { BiztechEvent, User } from "@/types";
import { QuestionTypes } from "@/constants/questionTypes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
const baseSchema = (hide: boolean) =>
  z.object({
    emailAddress: z
      .string()
      .email({ message: "Please enter a valid email address" }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    yearLevel: hide
      ? z.string().optional()
      : z.string().min(1, "Year level is required"),
    faculty: hide
      ? z.string().optional()
      : z.string().min(1, "Faculty is required"),
    majorSpecialization: hide
      ? z.string().optional()
      : z.string().min(1, "Major/Specialization is required"),
    preferredPronouns: z.enum([
      "He/Him/His",
      "She/Her/Hers",
      "They/Them/Their",
      "Other/Prefer not to say",
    ]),
    dietaryRestrictions: z.string().optional(),
    howDidYouHear: z
      .string()
      .min(1, "Please specify how you heard about this event"),
  });

interface AttendeeEventRegistrationFormProps {
  event: BiztechEvent;
  initialData?: Partial<z.infer<ReturnType<typeof createDynamicSchema>>>;
  onSubmit: (
    data: z.infer<ReturnType<typeof createDynamicSchema>>,
  ) => Promise<Boolean>;
  onSubmitPayment: (
    data: z.infer<ReturnType<typeof createDynamicSchema>>,
  ) => Promise<Boolean>;
  user: User;
}

const createDynamicSchema = (event: BiztechEvent) => {
  const hide = event?.id === "alumni-night";
  const dynamicSchema =
    event.registrationQuestions?.reduce(
      (acc, q) => {
        acc[q.questionId] = q.required
          ? z.string().min(1, "This field is required")
          : z.string().optional();
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ) || {};

  return baseSchema(hide).extend({
    customQuestions: z.object(dynamicSchema),
  });
};

export const AttendeeEventRegistrationForm: React.FC<
  AttendeeEventRegistrationFormProps
> = ({ event, initialData, onSubmit, onSubmitPayment, user }) => {
  const [otherCheckedStates, setOtherCheckedStates] = useState<{
    [key: string]: any;
  }>({});
  const schema = useMemo(() => createDynamicSchema(event), [event]);
  type FormValues = z.infer<ReturnType<typeof createDynamicSchema>>;

  const HIDE_STUDENT_FIELDS = event?.id === "alumni-night";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      emailAddress: user.email || user.id,
      firstName: "",
      lastName: "",
      yearLevel: "",
      faculty: "",
      majorSpecialization: "",
      preferredPronouns: "He/Him/His",
      dietaryRestrictions: "",
      howDidYouHear: "",
      customQuestions: {},
    },
  });

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    if (await onSubmit(data)) {
      toast({
        title: "Registration Submitted",
        description: "Your registration has been successfully submitted.",
      });
    }
  };

  const handlePaymentSubmit: SubmitHandler<FormValues> = async (data) => {
    if (await onSubmitPayment(data)) {
      toast({
        title: "Registration Submitted",
        description: "Your registration has been successfully submitted.",
      });
    }
  };

  const uploadFile = async (
    questionId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const url = await uploadFileToGoogleDrive(file, event.id);
      form.setValue(`customQuestions.${questionId}`, url);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const uploadFileToGoogleDrive = async (
    file: File,
    folderId: string,
  ): Promise<string> => {
    // Function to read file as base64
    const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          } else {
            reject(new Error("Failed to read file as base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      // Read file as base64
      const rawLog = await readFileAsBase64(file);

      // Prepare data to send to API
      const dataSend = {
        dataReq: {
          data: rawLog,
          name: file.name,
          type: file.type,
          folderId: folderId, // Changed from event.id to folderId
        },
        fname: "uploadFilesToGoogleDrive",
      };

      // Make the API call
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzLif9Uypau-R54Ob-g3bs9jqWujIzfXFvZEMKx7k5m3KfZZNlPUwj-dIdKh7dMaxTotA/exec",
        {
          method: "POST",
          body: JSON.stringify(dataSend),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Assuming the API returns a URL, otherwise adjust accordingly
      return result.url || "";
    } catch (error) {
      console.error("Error in uploadFileToGoogleDrive:", error);
      throw error;
    }
  };

  return (
    <div className="flex text-white font-satoshi">
      {/* Main content */}
      <div className="flex-1">
        <Form {...form}>
          <form
            onSubmit={
              !user?.admin &&
              (event.pricing?.nonMembers > 0 || event.pricing?.members > 0)
                ? form.handleSubmit(handlePaymentSubmit)
                : form.handleSubmit(handleSubmit)
            }
          >
            {/* Preview column */}
            <div className="container py-10">
              <div className="space-y-4 p-4 max-w-lg mx-auto relative">
                {/* Event Image */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {event?.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt="Event Cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Event Cover Photo</span>
                  )}
                </div>

                <div className="flex flex-col items-start">
                  {/* Event Name */}
                  <h3 className="text-white font-bold">{event?.ename}</h3>

                  {/* Event Location and Date */}
                  <div className="flex flex-row items-center gap-4 w-full">
                    <div className="rounded-md items-center px-2.5 py-1 font-[700] w-full text-white bg-[#6578A8] text-[7px] sm:text-[8px] md:text-[9px] lg:text-[12px] flex whitespace-nowrap overflow-hidden">
                      <Building className="mr-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{event?.elocation}</span>
                    </div>

                    <div className="rounded-md items-center px-2.5 py-1 font-[700] w-full text-white bg-[#6578A8] text-[7px] sm:text-[8px] md:text-[9px] lg:text-[12px] flex whitespace-nowrap overflow-hidden">
                      <Calendar className="mr-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="sm:hidden truncate">
                        {shortformatDate(event?.startDate)}
                      </span>
                      <span className="hidden sm:block truncate">
                        {extractTime(event?.startDate)}{" "}
                        {extractMonthDay(event?.startDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <p className="text-white whitespace-pre-line">
                  {event?.description}
                </p>

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4 items-center">
                        <FormLabel>Email*</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          disabled={!!user.email || !!user.id}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4 items-center">
                        <FormLabel>First Name*</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4 items-center">
                        <FormLabel>Last Name*</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {!HIDE_STUDENT_FIELDS && (
                  <FormField
                    control={form.control}
                    name="yearLevel"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-4 items-center">
                          <FormLabel>Year Level*</FormLabel>
                          <FormMessage />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-white">
                              <SelectValue placeholder="Select year level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="year1">Year 1</SelectItem>
                            <SelectItem value="year2">Year 2</SelectItem>
                            <SelectItem value="year3">Year 3</SelectItem>
                            <SelectItem value="year4">Year 4</SelectItem>
                            <SelectItem value="year5+">Year 5+</SelectItem>
                            <SelectItem value="notApplicable">
                              Not Applicable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
                {!HIDE_STUDENT_FIELDS && (
                  <FormField
                    control={form.control}
                    name="faculty"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-4 items-center">
                          <FormLabel>Faculty*</FormLabel>
                          <FormMessage />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-white">
                              <SelectValue placeholder="Select faculty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="commerce">Commerce</SelectItem>
                            <SelectItem value="engineering">
                              Engineering
                            </SelectItem>
                            <SelectItem value="landFoodSystems">
                              Land and Food Systems
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
                {!HIDE_STUDENT_FIELDS && (
                  <FormField
                    control={form.control}
                    name="majorSpecialization"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-4 items-center">
                          <FormLabel>Major / Specialization*</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input placeholder="Enter your major" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="preferredPronouns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4 items-center">
                        <FormLabel>Preferred Pronouns*</FormLabel>
                        <FormMessage />
                      </div>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        {[
                          "He/Him/His",
                          "She/Her/Hers",
                          "They/Them/Their",
                          "Other/Prefer not to say",
                        ].map((pronoun) => (
                          <FormItem
                            key={pronoun}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <RadioGroupItem value={pronoun} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {pronoun}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-row gap-4 items-center">
                        <FormLabel>
                          Do you have any dietary restrictions?*
                        </FormLabel>
                        <FormMessage />
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Select dietary restrictions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="glutenFree">
                            Gluten-free
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="howDidYouHear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about this event?*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormMessage />
                        <FormControl>
                          <SelectTrigger className="text-white">
                            <SelectValue placeholder="Select how you heard about the event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="friends">
                            Friends / Word of mouth
                          </SelectItem>
                          <SelectItem value="social">Social media</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Custom Questions */}
                {event?.registrationQuestions?.map((question) => (
                  <FormField
                    key={question.questionId}
                    control={form.control}
                    name={`customQuestions.${question.questionId}`} // Use question.id instead of index
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-4 items-center">
                          <FormLabel>
                            {question.label}
                            {question.required && "*"}
                          </FormLabel>
                          <FormMessage />
                        </div>
                        {question.type === QuestionTypes.TEXT && (
                          <FormControl>
                            <Input
                              placeholder={`Enter your answer`}
                              {...field}
                            />
                          </FormControl>
                        )}
                        {question.type === QuestionTypes.CHECKBOX && (
                          <FormControl>
                            <div className="space-y-2">
                              {question?.choices?.split(",").map((choice) => (
                                <FormField
                                  key={choice}
                                  name={`customQuestions.${question.questionId}`}
                                  render={({ field }) => {
                                    const selectedChoices = field.value
                                      ? field.value.split(", ")
                                      : [];
                                    const isChecked =
                                      selectedChoices.includes(choice);
                                    const isOtherChecked =
                                      otherCheckedStates[question.questionId] ||
                                      false;
                                    return (
                                      <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                          {choice.toLowerCase() === "other" ? (
                                            <>
                                              <Checkbox
                                                checked={isOtherChecked}
                                                onCheckedChange={(checked) => {
                                                  setOtherCheckedStates(
                                                    (prev) => ({
                                                      ...prev,
                                                      [question.questionId]:
                                                        checked as boolean,
                                                    }),
                                                  );
                                                  if (!checked) {
                                                    // Remove 'Other' and any custom input from the field value
                                                    const newValue =
                                                      selectedChoices
                                                        .filter(
                                                          (v: string) =>
                                                            v !== "Other" &&
                                                            !v.startsWith(
                                                              "Other:",
                                                            ),
                                                        )
                                                        .join(", ");
                                                    field.onChange(newValue);
                                                  } else {
                                                    // Add 'Other' to the field value
                                                    const newValue = [
                                                      ...selectedChoices,
                                                      "Other",
                                                    ].join(", ");
                                                    field.onChange(newValue);
                                                  }
                                                }}
                                              />
                                              {isOtherChecked && (
                                                <Input
                                                  placeholder="Enter other option"
                                                  value={
                                                    selectedChoices
                                                      .find((v: string) =>
                                                        v.startsWith("Other:"),
                                                      )
                                                      ?.substring(6) || ""
                                                  }
                                                  onChange={(e) => {
                                                    const otherValue =
                                                      e.target.value;
                                                    let newValue =
                                                      selectedChoices
                                                        .filter(
                                                          (v: string) =>
                                                            v !== "Other" &&
                                                            !v.startsWith(
                                                              "Other:",
                                                            ),
                                                        )
                                                        .concat(
                                                          `Other:${otherValue}`,
                                                        )
                                                        .join(", ");
                                                    field.onChange(newValue);
                                                  }}
                                                  className="mt-2"
                                                />
                                              )}
                                            </>
                                          ) : (
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                let newValue;
                                                if (checked) {
                                                  newValue =
                                                    selectedChoices.length
                                                      ? `${field.value}, ${choice}`
                                                      : choice;
                                                } else {
                                                  newValue = selectedChoices
                                                    .filter(
                                                      (v: string) =>
                                                        v !== choice,
                                                    )
                                                    .join(", ");
                                                }
                                                field.onChange(newValue);
                                              }}
                                            />
                                          )}
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {choice}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </FormControl>
                        )}
                        {question.type === QuestionTypes.SELECT && (
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-white">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {question.choices
                                  ?.split(",")
                                  .map((choice, choiceIndex) => (
                                    <SelectItem
                                      key={choiceIndex}
                                      value={choice}
                                    >
                                      {choice}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        )}
                        {question.type === QuestionTypes.WORKSHOP_SELECTION && (
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-white">
                                  <SelectValue placeholder="Select a workshop" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {question.choices
                                  ?.split(",")
                                  .map((choice, choiceIndex) => (
                                    <SelectItem
                                      key={choiceIndex}
                                      value={choice}
                                    >
                                      {choice}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        )}
                        {question.type === QuestionTypes.UPLOAD && (
                          <FormControl>
                            <input
                              type="file"
                              onChange={(e) =>
                                uploadFile(question.questionId, e)
                              }
                              className="block w-full h-full text-sm text-gray-500
                                                                    file:mr-4 file:py-2 file:px-4 file:rounded-md
                                                                    file:border-0 file:text-sm file:font-semibold
                                                                    cursor-pointer"
                            />
                          </FormControl>
                        )}
                      </FormItem>
                    )}
                  />
                ))}
                <div className="h-px my-8" />
                {user?.admin ? (
                  <Button type="submit">Submit</Button>
                ) : !user?.admin &&
                  ((user?.isMember && event.pricing?.members > 0) ||
                    (!user?.isMember && event.pricing?.nonMembers)) &&
                  !event.isApplicationBased ? (
                  <Button type="submit">Proceed to Payment</Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

const customQuestionSchema = z.object({
  type: z.enum(["text", "checkbox", "select", "upload", "workshopSelection"]),
  question: z.string().min(1, "Question is required"),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  characterLimit: z.number().optional(),
});

const eventFormSchema = z.object({
  eventName: z.string().min(2, "Event name must be at least 2 characters"),
  eventSlug: z.string().min(2, "Event slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  feedbackFormUrl: z.string().url().optional(),
  isApplicationBased: z.boolean(),
  nonBizTechAllowed: z.boolean(),
  imageUrl: z.string().url("Invalid image URL"),
  customQuestions: z.array(customQuestionSchema),
});

type EventFormSchema = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormSchema>;
  onSubmit: (data: EventFormSchema) => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialData || {
      customQuestions: [],
      isApplicationBased: false,
      nonBizTechAllowed: false,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const { append, remove } = useFieldArray({
    control: form.control,
    name: "customQuestions",
  });

  const customQuestions = useWatch({
    control: form.control,
    name: "customQuestions",
  });

  const handleSubmit = (data: Partial<EventFormSchema>) => {
    // Type assertion to EventFormSchema
    onSubmit(data as EventFormSchema);
    toast({
      title: "Event Created",
      description: "Your event has been successfully created.",
    });
  };

  const addCustomQuestion = () => {
    append({
      type: "text",
      question: "",
      required: false,
      options: [],
    });
  };

  return (
    <div className="flex text-white">
      {/* Main content */}
      <div className="flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-2 gap-8">
              {/* Preview column */}
              <div className="container py-10">
                <Tabs defaultValue="member">
                  <TabsList>
                    <TabsTrigger value="member">Member Form</TabsTrigger>
                    <TabsTrigger value="partner">Partner Form</TabsTrigger>
                  </TabsList>
                  <TabsContent value="member">
                    <div className="space-y-4 p-4">
                      {/* Event Image */}
                      <div
                        className={`aspect-video bg-gray-200 rounded-lg overflow-hidden ${form.watch("imageUrl") ? "relative" : "flex items-center justify-center"}`}
                      >
                        {form.watch("imageUrl") ? (
                          <Image
                            src={form.watch("imageUrl") || ""}
                            alt="Event Cover"
                            fill
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // TODO - Next's <Image> doesn't easily work here, would prefer to replace
                          <span className="text-gray-400">
                            Event Cover Photo
                          </span>
                        )}
                      </div>

                      {/* Event Name */}
                      <h3 className="text-white font-bold mt-4">
                        {form.watch("eventName") || "Event Name"}
                      </h3>

                      {/* Event Description */}
                      <p className="text-bt-green-300 whitespace-pre-line">
                        {form.watch("description") ||
                          "Event description will appear here."}
                      </p>

                      <FormField
                        name="previewFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your first name"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your last name"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email*</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewYearLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Level*</FormLabel>
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
                      <FormField
                        name="previewFaculty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Faculty*</FormLabel>
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
                                <SelectItem value="commerce">
                                  Commerce
                                </SelectItem>
                                <SelectItem value="landFoodSystems">
                                  Land and Food Systems
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewMajor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Major / Specialization*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your major"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewPronouns"
                        render={() => (
                          <FormItem>
                            <FormLabel>Preferred Pronouns*</FormLabel>
                            <div className="space-y-2">
                              {[
                                "He/Him/His",
                                "She/Her/Hers",
                                "They/Them/Their",
                                "Other/Prefer not to say",
                              ].map((pronoun) => (
                                <FormField
                                  key={pronoun}
                                  name={`previewPronouns.${pronoun}`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {pronoun}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewDietaryRestrictions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Do you have any dietary restrictions?*
                            </FormLabel>
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
                                <SelectItem value="vegetarian">
                                  Vegetarian
                                </SelectItem>
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
                        name="previewHearAboutEvent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              How did you hear about this event?*
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-white">
                                  <SelectValue placeholder="Select how you heard about the event" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="friends">
                                  Friends / Word of mouth
                                </SelectItem>
                                <SelectItem value="social">
                                  Social media
                                </SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="previewSchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What school do you attend?*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-white">
                                  <SelectValue placeholder="Select your school" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ubc">UBC</SelectItem>
                                <SelectItem value="sfu">SFU</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      {/* Custom Questions */}
                      {form.watch("customQuestions")?.map((question, index) => (
                        <div key={index} className="space-y-2">
                          <FormField
                            name={`previewCustom${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {question.question}
                                  {question.required && "*"}
                                </FormLabel>
                                {question.type === "text" && (
                                  <FormControl>
                                    <Input
                                      placeholder={`Enter your answer`}
                                      {...field}
                                    />
                                  </FormControl>
                                )}
                                {question.type === "checkbox" && (
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                )}
                                {question.type === "select" && (
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
                                        {question.options?.map(
                                          (option, optionIndex) => (
                                            <SelectItem
                                              key={optionIndex}
                                              value={option}
                                            >
                                              {option}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                )}
                                {question.type === "upload" && (
                                  <FormControl>
                                    <Input {...field} placeholder="File URL" />
                                  </FormControl>
                                )}
                                {question.type === "workshopSelection" && (
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
                                        {question.options?.map(
                                          (option, optionIndex) => (
                                            <SelectItem
                                              key={optionIndex}
                                              value={option}
                                            >
                                              {option}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                )}
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="partner">
                    <div className="bg-[#1E293B] p-4 rounded-lg">
                      <span>TBD, Partner form content goes here</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Edit form column */}
              <div className="space-y-6 bg-[#253251] container py-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Create New Event</h3>
                  <Button type="submit" className="bg-bt-green-300">
                    SAVE
                  </Button>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="isApplicationBased"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        This is an application based event (i.e. you will accept
                        / reject applicants)
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nonBizTechAllowed"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Non-BizTech members allowed?
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <h4 className="text-bt-blue-100">Event Cover Photo</h4>
                      <FormControl>
                        <Input placeholder="Image URL*" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h4 className="text-bt-blue-100">Event Information</h4>

                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Slug (URL)*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date & Time*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-[#3A496D] text-white",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date & Time*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal  bg-[#3A496D] text-white",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedbackFormUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback Form URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h4 className="text-bt-blue-100">
                    Attendee Form Custom Questions
                  </h4>
                  {customQuestions?.map((field, index) => (
                    <div
                      key={index}
                      className="my-4 p-4 border rounded-lg bg-[#3A4A70]"
                    >
                      <FormField
                        control={form.control}
                        name={`customQuestions.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-white">
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="checkbox">
                                  Checkbox
                                </SelectItem>
                                <SelectItem value="select">
                                  Selection
                                </SelectItem>
                                <SelectItem value="upload">Upload</SelectItem>
                                <SelectItem value="workshopSelection">
                                  Workshop Selection
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`customQuestions.${index}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`customQuestions.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Required
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {(field.type === "select" ||
                        field.type === "checkbox" ||
                        field.type === "workshopSelection") && (
                        <FormField
                          control={form.control}
                          name={`customQuestions.${index}.options`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Options</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter options, separated by commas"
                                  value={field.value?.join(", ") || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        .split(",")
                                        .map((opt) => opt.trim()),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                Separate options by commas, no spaces
                                (Option1,Option2)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {field.type === "upload" && (
                        <FormField
                          control={form.control}
                          name={`customQuestions.${index}.imageUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>File URL</FormLabel>

                              {/* TODO - probably don't need an input here.*/}

                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {field.type === "text" && (
                        <FormField
                          control={form.control}
                          name={`customQuestions.${index}.characterLimit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Character Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                      >
                        Remove Question
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addCustomQuestion}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Question
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

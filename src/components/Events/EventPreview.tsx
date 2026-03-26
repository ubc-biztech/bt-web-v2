import React from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Building, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFormSchema } from "./EventFormSchema";
import { PreviewForm } from "./PreviewForm";
import {
  extractTime,
  extractMonthDay,
  shortformatDate,
} from "@/util/extractDate";
import Image from "next/image";

interface EventPreviewProps {
  form: UseFormReturn<EventFormSchema>;
}

export const EventPreview: React.FC<EventPreviewProps> = ({ form }) => {
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const eventName = useWatch({ control: form.control, name: "eventName" });
  const location = useWatch({ control: form.control, name: "location" });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const description = useWatch({ control: form.control, name: "description" });

  return (
    <Tabs defaultValue="member">
      <TabsList>
        <TabsTrigger value="member">Member Form</TabsTrigger>
        <TabsTrigger value="partner">Partner Form</TabsTrigger>
      </TabsList>
      <TabsContent value="member">
        <div className="space-y-4 mt-8">
          <div className="aspect-video bg-gray-200 rounded-lg relative flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Event Cover"
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
            ) : (
              <span className="text-gray-400">Event Cover Photo</span>
            )}
          </div>

          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold">
              {eventName || "Event Name"}
            </h3>

            {/* Event Location and Date */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
              <div className="rounded-md items-center px-2.5 py-1 font-[700] text-white bg-[#6578A8] text-[7px] md:text-[10px] lg:text-[12px] w-full flex whitespace-nowrap overflow-hidden">
                <Building className="mr-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">{location || "Location"}</span>
              </div>

              <div className="rounded-md items-center px-2.5 py-1 font-[700] text-white bg-[#6578A8] text-[7px] md:text-[10px] lg:text-[12px] w-full flex whitespace-nowrap overflow-hidden">
                <Calendar className="mr-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">
                  {startDate
                    ? `${extractTime(startDate.toISOString())} ${extractMonthDay(startDate.toISOString())}`
                    : "Date"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-bt-green-300 whitespace-pre-line">
            {description || "Event description will appear here."}
          </p>
          <PreviewForm form={form} />
        </div>
      </TabsContent>
      <TabsContent value="partner">
        <div className="bg-[#1E293B] p-4 rounded-lg">
          <span>TBD, Partner form content goes here</span>
        </div>
      </TabsContent>
    </Tabs>
  );
};

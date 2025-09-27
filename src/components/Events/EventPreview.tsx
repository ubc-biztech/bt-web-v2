import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FaRegBuilding, FaRegCalendar } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFormSchema } from "./EventFormSchema";
import { PreviewForm } from "./PreviewForm";
import { extractTime, extractMonthDay } from "@/util/extractDate";
import { formatDate } from "@/components/companion/productX/constants/formatDate";
import Image from "next/image";

interface EventPreviewProps {
  form: UseFormReturn<EventFormSchema>;
}

export const EventPreview: React.FC<EventPreviewProps> = ({ form }) => {
  return (
    <Tabs defaultValue="member">
      <TabsList>
        <TabsTrigger value="member">Member Form</TabsTrigger>
        <TabsTrigger value="partner">Partner Form</TabsTrigger>
      </TabsList>
      <TabsContent value="member">
        <div className="space-y-4 mt-8">
          <div className="aspect-video bg-gray-200 rounded-lg relative flex items-center justify-center overflow-hidden">
            {form.watch("imageUrl") ? (
              <Image
                src={form.watch("imageUrl")}
                alt="Event Cover"
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <span className="text-gray-400">Event Cover Photo</span>
            )}
          </div>

          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold">
              {form.watch("eventName") || "Event Name"}
            </h3>

            {/* Event Location and Date */}
            <div className="flex flex-row items-center gap-4">
              <div className="rounded-md px-2.5 py-1 font-[700] text-white bg-[#6578A8] text-[7px] md:text-[10px] lg:text-[12px] flex items-center">
                <FaRegBuilding className="mr-1" />
                {form.watch("location") || "Location"}
              </div>

              <div className="rounded-md px-2.5 py-1 font-[700] text-white bg-[#6578A8] text-[7px] md:text-[10px] lg:text-[12px] flex items-center">
                <FaRegCalendar className="mr-1" />
                <span className="sm:hidden">
                  {form.watch("startDate") ? formatDate(form.watch("startDate").toISOString()) : "Date"}
                </span>
                <span className="hidden sm:block">
                  {form.watch("startDate") ? `${extractTime(form.watch("startDate").toISOString())} ${extractMonthDay(form.watch("startDate").toISOString())}` : "Date"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-bt-green-300 whitespace-pre-line">
            {form.watch("description") || "Event description will appear here."}
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

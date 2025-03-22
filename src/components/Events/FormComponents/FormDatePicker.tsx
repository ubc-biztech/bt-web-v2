import React from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TimePickerDemo } from "@/components/ui/time-picker";

interface FormDatePickerProps {
    name: string;
    label: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({ name, label }) => {
    const { control } = useFormContext();
    const timeZone = "America/Los_Angeles"; // Pacific Time

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left pt-8 pb-8 font-normal bg-[#3A496D] font-poppins text-white text-wrap",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, `PPP 'at' hh:mm a '${Intl.DateTimeFormat().resolvedOptions().timeZone}'`)
                                    ) : (
                                        <span>Pick a date and time</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#3A496D]" align="start">
                            <div className="p-4">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                                <div className="mt-4">
                                    <TimePickerDemo 
                                        date={field.value} 
                                        setDate={(date) => field.onChange(date)}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

import * as React from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  


// Radio Interfaces
interface RadioOption {
    value: string;
    label: string;
}
interface FormRadioProps {
    items: RadioOption[];
    title: string;
}
//Form Input Props
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    title: string;
}
interface MultiSelectOption {
    value: string;
    label: string;
}
interface FormMultiSelectProps {
    items: MultiSelectOption[];
    title: string;
}
interface SelectOption {
    value: string;
    label: string;
}
interface FormSelectProps {
    items: SelectOption[];
    title: string;
    field: any;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ className, type, title, ...props }, ref) => (
        <FormItem className="w-full">
            <FormLabel className="text-baby-blue font-poppins">
                {title}
            </FormLabel>
            <FormControl>
                <Input
                    type={type}
                    className={cn(
                        "bg-signup-input-bg border-2 border-signup-input-border mt-2",
                        "focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none",
                        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:shadow-none",
                        "focus:border-biztech-green focus:border-opacity-50",
                        "!ring-0 !ring-offset-0 !shadow-none",
                        "transition-colors duration-200",
                        className
                    )}
                    style={{
                        boxShadow: 'none',
                    }}
                    ref={ref}
                    {...props}
                />
            </FormControl>
        </FormItem>
    )
);

FormInput.displayName = "FormInput";
// FormRadio Component
export const FormRadio = React.forwardRef<HTMLDivElement, FormRadioProps>(
    ({ items, title }, ref) => {
        return (
            <FormItem className="space-y-3 mr-auto" ref={ref}>
                <FormLabel className="text-baby-blue font-poppins mr-auto">{title}</FormLabel>
                <FormControl>
                    <RadioGroup className="flex flex-col space-y-2">
                        {items.map((item) => (
                            <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem 
                                        value={item.value}
                                        className="h-5 w-5 rounded-full border-2 border-white bg-transparent
                                                flex items-center justify-center">
                                        <div className="h-2.5 w-2.5 rounded-full bg-white transform scale-0 transition-transform duration-200 ease-in-out data-[state=checked]:scale-100" />
                                    </RadioGroupItem>
                                </FormControl>
                                <FormLabel className="font-poppins font-medium text-white-blue cursor-pointer">
                                    {item.label}
                                </FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
            </FormItem>
        );
    }
);

FormRadio.displayName = "FormRadio";

// Multi-Select Component
export const FormMultiSelect = React.forwardRef<HTMLDivElement, FormMultiSelectProps>(
    ({ title, items }, ref) => {
        return (
            <div className="mr-auto">
                <FormLabel className="text-baby-blue font-poppins">{title}</FormLabel>
                {items.map((item) => (
                        <FormItem key={item.value} className="flex items-center space-x-3 space-y-0 mt-5">
                            <FormControl>
                                <Checkbox className="border-2 mr-1">
                                </Checkbox>
                            </FormControl>
                            <FormLabel className="font-poppins font-medium text-white-blue cursor-pointer">
                                {item.label}
                            </FormLabel>
                        </FormItem>
                    ))
                }
            </div>
        );
    }
);
FormMultiSelect.displayName = "FormMultiSelect";

// Select Component
export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
    ({ title, items, field }, ref) => {
        return (
            <FormItem className="w-full">
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormLabel className="text-baby-blue font-poppins">{title}</FormLabel>   
                 <FormControl className={cn(
                        "bg-signup-input-bg border-2 border-signup-input-border mt-2",
                        "focus:ring-0 focus:ring-offset-0 focus:outline-none focus:shadow-none",
                        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:shadow-none",
                        "focus:border-biztech-green focus:border-opacity-50 text-white-blue",
                        "!ring-0 !ring-offset-0 !shadow-none",
                        "transition-colors duration-200",
                    )}>
                   <SelectTrigger>
                     <SelectValue placeholder="-Select-" />
                   </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item.label} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))
                    }
                 </SelectContent>
               </Select>
             </FormItem>
        );
    }
);
FormSelect.displayName = "FormSelect";

// Select Component

// export function SelectForm() {
//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//   })

//   function onSubmit(data: z.infer<typeof FormSchema>) {
//     toast({
//       title: "You submitted the following values:",
//       description: (
//         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
//           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//     })
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a verified email to display" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectItem value="m@example.com">m@example.com</SelectItem>
//                   <SelectItem value="m@google.com">m@google.com</SelectItem>
//                   <SelectItem value="m@support.com">m@support.com</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormDescription>
//                 You can manage email addresses in your{" "}
//                 <Link href="/examples/forms">email settings</Link>.
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit">Submit</Button>
//       </form>
// }
//     </Form>
//   )

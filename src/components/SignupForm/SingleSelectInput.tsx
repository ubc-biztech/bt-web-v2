import * as React from "react";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem} from '../ui/radio-group'
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    dropdown?: boolean;
    field: {
        onChange: (value: any) => void;
        value: any;
    };
}

const SingleSelectInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, title, field, ...props }, ref) => {
        return (
            <div className="text-baby-blue font-poppins text-sm w-11/12 mb-7">
                <FormItem className="space-y-3">
                    <FormLabel>Notify me about...</FormLabel>
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="all" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    All new messages
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="mentions" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    Direct messages and mentions
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="none" />
                                </FormControl>
                                <FormLabel className="font-normal">Nothing</FormLabel>
                            </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </div>
        );
    }
);

SingleSelectInput.displayName = "SingleSelectInput";

export default SingleSelectInput;
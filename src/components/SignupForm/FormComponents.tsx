import * as React from "react";

import { cn } from "@/lib/utils";

import { Label } from '../ui/label'
import { Input } from '../ui/input'

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel as FormLabelUI, 
    FormMessage,
} from "@/components/ui/form"

import { format } from 'path';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
}

const FormLabel = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, title, ...props}, ref) => {
        
        return (
            <FormLabelUI className={cn(
                "text-baby-blue font-poppins text-sm w-11/12 mb-7",
                className
            )}>{title}</FormLabelUI> 
        );
    }
);

FormLabel.displayName = "FormLabel";

export { FormLabel };

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const TextInput: React.FC<{
  form: UseFormReturn<any>;
  name: string;
  placeholder: string;
  description?: string;
  tooltip: string;
  className?: string;
}> = ({ form, name, placeholder, description, className, tooltip }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`grow ${className}`}>
          <FormControl>
            <Input
              className="font-400 text-white bg-[#293553] transition-opacity rounded-[3px] rounded-b-none border-bt-blue-100 border-b-1 border-t-0 border-l-0 border-r-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-bt-green-300"
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <div className="flex flex-row items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FormDescription>{description}</FormDescription>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <FormMessage className="text-bt-blue-100 text-xs" />
          </div>
        </FormItem>
      )}
    />
  );
};

export default TextInput;

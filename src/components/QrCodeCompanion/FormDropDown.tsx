import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormMessage, FormControl, FormDescription } from "../ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import DropDownTab from "./DropDown";

const DropDown: React.FC<{
  form: UseFormReturn<any>;
  name: string;
  placeholder: string;
  tooltip: string;
  description?: string;
  options: string[];
}> = ({ form, name, placeholder, description, tooltip, options }) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className='grow'>
        <FormControl>
          <DropDownTab
            value={field.value}
            valueChange={field.onChange}
            nullVal={null}
            placeholder={placeholder}
            options={options}
            className='w-full bg-[#293553] rounded-none rounded-t-[3px] border-0 border-b-[1px] h-min border-baby-blue font-400 p-2 px-4 placeholder:text-muted-foreground'
          />
        </FormControl>
        <div className='flex flex-row items-center space-x-4'>
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
          <FormMessage className='text-baby-blue text-xs' />
        </div>
      </FormItem>
    )}
  />
);

export default DropDown;

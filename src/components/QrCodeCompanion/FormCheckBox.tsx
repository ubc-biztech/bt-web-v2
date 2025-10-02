import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";

const CheckBox: React.FC<{
  form: UseFormReturn<any>;
  name: string;
  description?: string;
}> = ({ form, name, description }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="grow">
          <div className="flex flex-row items-center space-x-4">
            <FormControl>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormControl>
            <FormDescription className="text-white">
              {description}
            </FormDescription>
            <FormMessage className="text-bt-blue-100 text-xs" />
          </div>
        </FormItem>
      )}
    />
  );
};

export default CheckBox;

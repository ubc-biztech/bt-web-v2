import { FC } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { QrType } from "./types";
import { Button } from "../ui/button";
import { Form, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import TextInput from "./TextInput";
import NumberInput from "./NumberInput";
import DropDownTab from "./DropDown";
import CheckBox from "./CheckBox";
import { fetchBackend } from "@/lib/db";
interface FormProps {}

const formSchema = z
  .object({
    name: z.string().min(1, "Companion QR must have a name"),
    eventID: z.string().min(1, "Event ID is required"),
    points: z.coerce.number(),
    isUnlimitedScans: z.boolean(),
    year: z.coerce.number(),
    type: z.string().min(1, "Must select a type"),
    partnerID: z.string().email().or(z.literal("")),
    linkedin: z.string().url().or(z.literal("")),
    workshopID: z.string().optional()
  })
  .superRefine((values, ctx) => {
    if (values.type === QrType.partner && (values.partnerID === "" || values.linkedin === "")) {
      ctx.addIssue({
        message: "Partner email and linkedin are required",
        code: z.ZodIssueCode.custom,
        path: ["partnerID", "linkedin"]
      });
    } else if (values.type === QrType.workshop && values.workshopID === "") {
      ctx.addIssue({ message: "Workshop ID is required", code: z.ZodIssueCode.custom, path: ["workshopID"] });
    }
  });

export const CompanionForm: FC<FormProps> = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      eventID: "",
      points: 0,
      isUnlimitedScans: false,
      year: new Date().getFullYear(),
      type: "",
      partnerID: "",
      linkedin: "",
      workshopID: ""
    }
  });

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const generateIDString = (length: number) => {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + "-";
  };
  const type = useWatch({ control: form.control, name: "type" });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = {
        id: generateIDString(5) + values.name,
        eventID: values.eventID,
        year: Number(values.year),
        points: Number(values.points),
        isActive: true,
        type: values.type,
        data: (() => {
          if (values.type === "Partner") {
            return {
              partnerID: values.partnerID,
              linkedin: values.linkedin
            };
          } else if (values.type === "Workshop") {
            return {
              workshopID: values.workshopID
            };
          } else {
            return {};
          }
        })()
      };
      const res = await fetchBackend({ endpoint: "/qr", method: "POST", data: data });
      alert(res.message);
      // fetchQRs();
    } catch (err) {
      console.log(err);
    }
    console.log(values);
  }

  // Inputs must be hidden with classes instead of conditionally rendered, otherwise react-hook onSubmit will not be validated
  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CheckBox form={form} name='isUnlimitedScans' description='Unlimited Scans?' />
          <TextInput form={form} name='name' placeholder='Name*' description='QR Name' className='col-start-1' />
          <TextInput form={form} name='eventID' placeholder='Event ID*' description='Event ID' />
          <NumberInput form={form} name='year' placeholder='Year*' description='Event Year' />
          <NumberInput form={form} name='points' placeholder='Points*' description='Points' />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <DropDownTab
                  value={field.value}
                  valueChange={field.onChange}
                  nullVal={null}
                  placeholder='Type*'
                  options={[QrType.booth, QrType.partner, QrType.workshop]}
                  className='w-full bg-[#293553] rounded-none rounded-t-[3px] border-0 border-b-[1px] h-min border-baby-blue font-400 p-2 px-4 placeholder:text-muted-foreground'
                />
                <FormDescription>QR Type</FormDescription>
              </FormItem>
            )}
          />
          <TextInput
            form={form}
            name='partnerID'
            placeholder='Partner Email'
            description='Partner Email'
            className={`${type === QrType.partner ? "" : "hidden"}`}
          />
          <TextInput
            form={form}
            name='linkedin'
            placeholder='Linkedin URL'
            description='Partner Linkedin'
            className={`${type === QrType.partner ? "" : "hidden"}`}
          />
          <TextInput
            form={form}
            name='workshopID'
            placeholder='Workshop*'
            description='Workshop ID'
            className={`${type === QrType.workshop ? "" : "hidden"}`}
          />
          <Button className='col-start-1 w-[150px] bg-biztech-green text-login-form-card font-400' type='submit'>
            ADD QR
          </Button>
          <FormMessage />
        </form>
      </Form>
    </div>
  );
};

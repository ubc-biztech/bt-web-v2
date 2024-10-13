import { Dispatch, FC, SetStateAction, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { QR, QrType } from "./types";
import { Button } from "../ui/button";
import { Form } from "@/components/ui/form";
import TextInput from "./FormTextInput";
import NumberInput from "./FormNumberInput";
import CheckBox from "./FormCheckBox";
import { fetchBackend } from "@/lib/db";
import DropDown from "./FormDropDown";
interface FormProps {
  setQRs: Dispatch<SetStateAction<QR[]>>;
}

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

export const CompanionForm: FC<FormProps> = ({ setQRs }) => {
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
  const [submitState, setSubmitState] = useState("");

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const generateIDString = (length: number) => {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + "-";
  };

  const fetchData = async () => {
    const data = await fetchBackend({ endpoint: "/qr", method: "GET" });
    setQRs(data);
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
      setSubmitState(res.message);
      fetchData();
    } catch (err: any) {
      if (err.status && err.status === 406) {
        setSubmitState(err.message.message ? err.message.message : "Invalid Inputs");
      }
      console.error(err);
    }
  }

  // Inputs must be hidden with classes instead of conditionally rendered, otherwise react-hook onSubmit values are not instantiated
  // causes validation error
  return (
    <div className='w-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CheckBox form={form} name='isUnlimitedScans' description='Unlimited Scans?' />
          <TextInput
            form={form}
            name='name'
            placeholder='Name*'
            description='QR Name'
            className='col-start-1'
            tooltip='To prevent cheating, a random 5-character string will be attached to the front of the name upon creation.'
          />
          <TextInput form={form} name='eventID' placeholder='Event ID*' description='Event ID' tooltip='Refers to the slug of the event.' />
          <NumberInput
            form={form}
            name='year'
            placeholder='Year*'
            description='Event Year'
            tooltip='Specify year for the event QR companion'
          />
          <NumberInput
            form={form}
            name='points'
            placeholder='Points*'
            description='Points'
            tooltip='Negative values are allowed, which will deduct points (e.g. making a shop).'
          />
          <DropDown
            form={form}
            name='type'
            placeholder='Type*'
            options={[QrType.booth, QrType.partner, QrType.workshop]}
            tooltip='Select the type of QR code.'
            description='Qr Type'
          />
          <TextInput
            form={form}
            name='partnerID'
            placeholder='Partner Email'
            description='Partner Email'
            className={`${type === QrType.partner ? "" : "hidden"}`}
            tooltip="Specify the partner's email."
          />
          <TextInput
            form={form}
            name='linkedin'
            placeholder='Linkedin URL'
            description='Partner Linkedin'
            className={`${type === QrType.partner ? "" : "hidden"}`}
            tooltip="Specify the partner's linkedin url."
          />
          <TextInput
            form={form}
            name='workshopID'
            placeholder='Workshop*'
            description='Workshop ID'
            className={`${type === QrType.workshop ? "" : "hidden"}`}
            tooltip='Specifiy the Workshop ID'
          />
          <div className='flex flex-row items-center space-x-3 h-min'>
            <Button className='col-start-1 w-[150px] bg-biztech-green text-login-form-card font-400' type='submit'>
              ADD QR
            </Button>
            <p className='text-nowrap text-xs'>{submitState}</p>
          </div>
        </form>
      </Form>
    </div>
  );
};

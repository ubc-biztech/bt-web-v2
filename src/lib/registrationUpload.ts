import { z } from "zod";

const uploadResponseSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value)),
});

export async function uploadRegistrationFile(
  file: File,
  folderId: string,
): Promise<string> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read the selected file."));
        return;
      }
      resolve(reader.result.split(",")[1]);
    };
    reader.onerror = () =>
      reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbzLif9Uypau-R54Ob-g3bs9jqWujIzfXFvZEMKx7k5m3KfZZNlPUwj-dIdKh7dMaxTotA/exec",
    {
      method: "POST",
      body: JSON.stringify({
        dataReq: { data, name: file.name, type: file.type, folderId },
        fname: "uploadFilesToGoogleDrive",
      }),
    },
  );
  if (!response.ok) throw new Error("File upload failed. Please try again.");
  const result = uploadResponseSchema.safeParse(await response.json());
  if (!result.success)
    throw new Error(
      "The upload did not return a valid file URL. Please try again.",
    );
  return result.data.url;
}

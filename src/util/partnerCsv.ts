import Papa from "papaparse";
import { ParsedPartner } from "@/queries/partnerIngestion";

export type PartnerCsvParseResult = {
  partners: ParsedPartner[];
  errors: string[];
};

const REQUIRED_HEADERS = ["Email Address", "First Name", "Last Name"];

const getCell = (
  row: Record<string, unknown>,
  headers: string[],
): string => {
  for (const header of headers) {
    const value = row[header];
    if (value !== undefined && value !== null) {
      return String(value).trim();
    }
  }

  return "";
};

const hasRequiredHeaders = (headers: string[]): string[] => {
  return REQUIRED_HEADERS.filter((requiredHeader) =>
    !headers.includes(requiredHeader),
  );
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export async function parsePartnerCsv(
  file: File,
): Promise<PartnerCsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const missingHeaders = hasRequiredHeaders(headers);

        if (missingHeaders.length > 0) {
          resolve({
            partners: [],
            errors: missingHeaders.map(
              (header) => `Missing required column: ${header}`,
            ),
          });
          return;
        }

        const partners: ParsedPartner[] = [];
        const errors: string[] = [];

        result.data.forEach((row, index) => {
          const rowNumber = index + 2;
          const email = getCell(row, ["Email Address"]).toLowerCase();
          const firstName = getCell(row, ["First Name"]);
          const lastName = getCell(row, ["Last Name"]);

          if (!email) {
            errors.push(`Row ${rowNumber} missing email`);
          } else if (!isValidEmail(email)) {
            errors.push(`Row ${rowNumber} has invalid email`);
          }

          if (!firstName) {
            errors.push(`Row ${rowNumber} missing first name`);
          }

          if (!lastName) {
            errors.push(`Row ${rowNumber} missing last name`);
          }

          partners.push({
            email,
            firstName,
            lastName,
            pronouns: getCell(row, ["Pronouns"]),
            linkedIn: getCell(row, ["LinkedIn", "Linkedin"]),
            company: getCell(row, [
              "Company",
              "What organization will you be representing?",
            ]),
            position: getCell(row, ["Position", "What is your current role?"]),
          });
        });

        resolve({
          partners,
          errors,
        });
      },
      error: (error) => {
        resolve({
          partners: [],
          errors: [error.message],
        });
      },
    });
  });
}

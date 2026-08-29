import Papa from "papaparse";
import { ParsedPartner } from "@/queries/partnerIngestion";

export type PartnerCsvParseResult = {
  partners: ParsedPartner[];
  errors: string[];
};

const HEADER_ALIASES = {
  email: ["Email Address", "Email", "E-mail"],
  firstName: ["First Name", "FirstName", "First", "Given Name"],
  lastName: ["Last Name", "LastName", "Last", "Surname", "Family Name"],
  pronouns: ["Pronouns"],
  linkedIn: ["LinkedIn", "Linkedin", "Linked In", "LinkedIn URL"],
  company: [
    "Company",
    "Organization",
    "Organisation",
    "What organization will you be representing?",
  ],
  position: ["Position", "Role", "Title", "What is your current role?"],
};

const REQUIRED_HEADERS = [
  { label: "Email Address", aliases: HEADER_ALIASES.email },
  { label: "First Name", aliases: HEADER_ALIASES.firstName },
  { label: "Last Name", aliases: HEADER_ALIASES.lastName },
];

const normalizeHeader = (header: string): string => {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeRow = (
  row: Record<string, unknown>,
): Record<string, unknown> => {
  return Object.entries(row).reduce<Record<string, unknown>>(
    (normalized, [header, value]) => {
      const normalizedHeader = normalizeHeader(header);
      if (!normalizedHeader) return normalized;

      if (
        normalized[normalizedHeader] === undefined ||
        normalized[normalizedHeader] === null ||
        normalized[normalizedHeader] === ""
      ) {
        normalized[normalizedHeader] = value;
      }

      return normalized;
    },
    {},
  );
};

const getCell = (row: Record<string, unknown>, headers: string[]): string => {
  for (const header of headers) {
    const value = row[normalizeHeader(header)];
    if (value !== undefined && value !== null) {
      return String(value).trim();
    }
  }

  return "";
};

const hasRequiredHeaders = (headers: string[]): string[] => {
  const normalizedHeaders = new Set(headers.map(normalizeHeader));

  return REQUIRED_HEADERS.filter(
    ({ aliases }) =>
      !aliases.some((alias) => normalizedHeaders.has(normalizeHeader(alias))),
  ).map(({ label }) => label);
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

        result.data.forEach((rawRow, index) => {
          const row = normalizeRow(rawRow);
          const rowNumber = index + 2;
          const email = getCell(row, HEADER_ALIASES.email).toLowerCase();
          const firstName = getCell(row, HEADER_ALIASES.firstName);
          const lastName = getCell(row, HEADER_ALIASES.lastName);

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
            pronouns: getCell(row, HEADER_ALIASES.pronouns),
            linkedIn: getCell(row, HEADER_ALIASES.linkedIn),
            company: getCell(row, HEADER_ALIASES.company),
            position: getCell(row, HEADER_ALIASES.position),
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

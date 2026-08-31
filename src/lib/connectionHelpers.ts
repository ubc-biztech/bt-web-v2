import {
  CONNECTION_TYPES,
  CONNECTION_TYPE_LABELS,
  type ConnectionType,
} from "@/constants/connectionTypes";
import type { Connection } from "@/types/companion";

export function getConnectionType(connection: Connection): ConnectionType {
  return connection.connectionType || CONNECTION_TYPES.ATTENDEE;
}

export function getConnectionTypeLabel(connection: Connection): string {
  return CONNECTION_TYPE_LABELS[getConnectionType(connection)];
}

export function getConnectionFullName(connection: Connection): string {
  return [connection.fname, connection.lname].filter(Boolean).join(" ").trim();
}

export function getConnectionInitials(connection: Connection): string {
  const first = connection.fname?.trim().charAt(0) ?? "";
  const last = connection.lname?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "?";
}

export function getConnectionProfileId(connection: Connection): string {
  if (connection.connectionID) return connection.connectionID;
  if (connection.type?.includes("#")) {
    return connection.type.split("#")[1] || "";
  }
  return "";
}

export function getConnectionLinkedIn(
  connection: Connection,
): string | undefined {
  const value = connection.linkedIn?.trim() || connection.linkedin?.trim();
  return value || undefined;
}

export function getConnectionProfilePicture(
  connection: Connection,
): string | undefined {
  const value = connection.profilePictureURL?.trim();
  return value || undefined;
}

export function getConnectionSubtitle(
  connection: Connection,
): string | undefined {
  if (getConnectionType(connection) === CONNECTION_TYPES.PARTNER) {
    return (
      [connection.company, connection.title].filter(Boolean).join(" · ") ||
      connection.major
    );
  }

  return connection.major;
}

export function connectionMatchesSearch(
  connection: Connection,
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    connection.fname,
    connection.lname,
    getConnectionFullName(connection),
    connection.major,
    connection.company,
    connection.title,
  ].some((field) =>
    String(field ?? "")
      .toLowerCase()
      .includes(normalized),
  );
}

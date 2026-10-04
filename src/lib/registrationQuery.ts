export function eventRegistrationsEndpoint(eventId: string, year: string) {
  // Encode query values so event IDs such as "product+" keep their literal +.
  const query = new URLSearchParams({ eventID: eventId, year });
  return `/registrations?${query.toString()}`;
}

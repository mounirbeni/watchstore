/**
 * The one place the store's contact details live.
 *
 * These were previously written by hand on every page, and drifted: the
 * footer and legal pages carried a placeholder landline, one WhatsApp link
 * pointed at 212600000000 and another at that same placeholder, and the
 * deposit instructions were a digit short. A customer who cannot reach the
 * seller is a contractual problem, not a typo, so they get a single source.
 */

/** Display form, spaced for readability. */
export const CONTACT_PHONE = "+212 601 439 975";

/** Dialable form, for tel: links. */
export const CONTACT_PHONE_E164 = "+212601439975";

/** wa.me wants digits only, no plus. */
export const WHATSAPP_HREF = "https://wa.me/212601439975";

/** When the shop is actually staffed — mirrored in the footer and the CGV. */
export const OPENING_HOURS = "Lun–Sam : 9h–18h";

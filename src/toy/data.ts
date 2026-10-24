// The toy agent's documents and scripted runs. Everything here is made up;
// the ideas (tool calls, retries, guardrails, a human in the loop) are real.

export type Field = { key: string; label: string; value: string };

/** One line in the run log. `field` highlights that field on the document. */
export type Step =
  | { kind: "tool"; tool: string; say: string; field?: string }
  | { kind: "ok"; say: string; field?: string }
  | { kind: "fail"; say: string; field?: string }
  | { kind: "fix"; say: string; field: string; value: string }
  | { kind: "ask"; say: string; yes: string; no: string };

export type Doc = {
  id: string;
  name: string;
  kind: string;
  blurry?: boolean;
  fields: Field[];
  /** Each attempt is a list of steps; every attempt but the last ends in a "fail". */
  attempts: Step[][];
  /** What happens after the last attempt. "ask" docs decide from the visitor's answer. */
  end: "escaped" | "dead" | "ask";
  route: string;
  deathNote?: string;
};

export const docs: Doc[] = [
  {
    id: "id",
    name: "id_card.jpg",
    kind: "Identity proof",
    fields: [
      { key: "name", label: "Name", value: "Meera Kapoor" },
      { key: "dob", label: "Date of birth", value: "14 Mar 1991" },
      { key: "number", label: "ID no.", value: "XXXX-XXXX-4821" },
    ],
    attempts: [
      [
        { kind: "tool", tool: "read_document", say: "Reading the card" },
        { kind: "ok", say: "Name matches the seller account", field: "name" },
        { kind: "ok", say: "Seller is over 18", field: "dob" },
        { kind: "tool", tool: "verify_id", say: "Checking the ID number", field: "number" },
        { kind: "ok", say: "ID verified", field: "number" },
      ],
    ],
    end: "escaped",
    route: "KYC",
  },
  {
    id: "tax",
    name: "tax_form.pdf",
    kind: "Tax registration",
    fields: [
      { key: "business", label: "Business", value: "Meera’s Pickles" },
      { key: "taxid", label: "Tax ID", value: "" },
      { key: "state", label: "State", value: "Delhi" },
    ],
    attempts: [
      [
        { kind: "tool", tool: "read_document", say: "Reading the form" },
        { kind: "ok", say: "Business name found", field: "business" },
        { kind: "fail", say: "Tax ID is blank. Schema check failed", field: "taxid" },
      ],
      [
        { kind: "tool", tool: "search_other_docs", say: "Looking for the tax ID elsewhere in the upload" },
        { kind: "fix", say: "Found it in the seller’s bank details", field: "taxid", value: "07ABCDE1234F1Z5" },
        { kind: "tool", tool: "validate_format", say: "Checking the format", field: "taxid" },
        { kind: "ok", say: "Format is valid", field: "taxid" },
        { kind: "ok", say: "Registered in Delhi", field: "state" },
      ],
    ],
    end: "escaped",
    route: "Tax",
  },
  {
    id: "deed",
    name: "IMG_2041.jpg",
    kind: "Shop lease (phone photo)",
    blurry: true,
    fields: [
      { key: "tenant", label: "Tenant", value: "M. Kapoor" },
      { key: "address", label: "Address", value: "Shop 12, Lajpat Nagar" },
      { key: "signature", label: "Signature", value: "~ M.K. ~" },
    ],
    attempts: [
      [
        { kind: "tool", tool: "read_document", say: "Reading the photo" },
        { kind: "fail", say: "Confidence 41%. Too blurry to trust", field: "signature" },
      ],
      [
        { kind: "tool", tool: "enhance_image", say: "Sharpening and reading again" },
        { kind: "ok", say: "Address readable now", field: "address" },
        { kind: "fail", say: "Signature still 58%. Below the 90% guardrail", field: "signature" },
      ],
      [
        { kind: "tool", tool: "ask_human", say: "Not guessing. Asking a human", field: "signature" },
        { kind: "ask", say: "Does this signature look like M. Kapoor’s?", yes: "Looks right", no: "Doesn’t match" },
      ],
    ],
    end: "ask",
    route: "Legal",
    deathNote: "Signature rejected by a human. Seller asked to re-upload.",
  },
  {
    id: "licence",
    name: "trade_licence.pdf",
    kind: "Trade licence",
    fields: [
      { key: "holder", label: "Holder", value: "Meera’s Pickles" },
      { key: "expiry", label: "Valid until", value: "31 Mar 2024" },
    ],
    attempts: [
      [
        { kind: "tool", tool: "read_document", say: "Reading the licence" },
        { kind: "ok", say: "Holder matches the business", field: "holder" },
        { kind: "fail", say: "Expired in March 2024", field: "expiry" },
      ],
      [
        { kind: "tool", tool: "search_other_docs", say: "Looking for a renewal in the upload" },
        { kind: "fail", say: "No renewal anywhere. Can’t retry my way out of this", field: "expiry" },
      ],
    ],
    end: "dead",
    route: "Legal",
    deathNote: "Seller notified to renew the licence.",
  },
];

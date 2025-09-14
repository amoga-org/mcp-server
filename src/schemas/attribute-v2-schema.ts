import { z } from "zod";

// Define component subtype mappings
const COMPONENT_SUBTYPE_MAP = {
  text: ["string", "text", "uuid", "password", "email", "comment", "instruction", "title", "Container", "richText"],
  enumeration: ["enumeration", "status", "priority", "multiselect"],
  user: ["assignee"],
  number: ["integer", "biginteger", "float"],
  boolean: ["toggle", "checkbox"],
} as const;

// Validation options
const VALIDATION_OPTIONS = [
  {
    key: "pancard",
    display_name: "PAN Card",
    regex: "/[A-Z]{3}[PCHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/",
    message: "Please enter 10 digit valid PAN number",
  },
  {
    key: "aadhar",
    display_name: "Aadhar number",
    regex: "/^[2-9]{1}[0-9]{11}$/",
    message: "Please enter a valid 12-digit Aadhar number",
  },
  {
    key: "vehicle",
    display_name: "Vehicle number",
    regex: "/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/",
    message: "Please enter a correct vehicle number",
  },
  {
    key: "mobile",
    display_name: "Mobile number",
    regex: "/^[6-9][0-9]{9}$/",
    message: "Please enter a 10 digit mobile number",
  },
  {
    key: "alphaAndnum",
    display_name: "Alphabets and numbers",
    regex: "/^(?=.*[a-zA-Z])(?=.*[0-9])([a-zA-Z0-9])+$/",
    message: "Value should contain both alphabets and numbers",
  },
  {
    key: "alpha",
    display_name: "Alphabets",
    regex: "/^[a-zA-Z ]*$/",
    message: "Value should contain only alphabets",
  },
  {
    key: "email",
    display_name: "Email",
    regex: "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/",
    message: "Please enter correct email id",
  },
  {
    key: "url",
    display_name: "URL",
    regex: "/^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/\\=]*)$/",
    message: "Invalid URL",
  },
  {
    key: "decimal",
    display_name: "Decimal",
    regex: "/^\\d+\\.?\\d*$/",
    message: "Value should be in Decimal",
  },
  {
    key: "number",
    display_name: "Number",
    regex: "/^[0-9]*$/",
    message: "Value should be a Number",
  },
];

// Date metadata schemas
const DateCalculativeMetaSchema = z.object({
  renderformat: z.literal("Subtraction"),
  includetime: z.boolean().default(false),
  timeformat: z.enum(["12", "24"]).default("12"),
  isRelative: z.literal(false),
  isCalculative: z.literal(true),
  operation: z.literal("subtraction"),
  includeShift: z.string().optional().default(""),
  firstAttribute: z.object({
    key: z.string(),
    display_name: z.string(),
  }),
  secondAttribute: z.object({
    key: z.string(),
    display_name: z.string(),
  }),
});

const DateAbsoluteMetaSchema = z.object({
  renderformat: z.enum(["dd/MM/yyyy", "MM/dd/yyyy", "dd MMM yyyy"]),
  includetime: z.boolean().default(true),
  timeformat: z.enum(["12", "24"]).default("24"),
  isRelative: z.literal(false),
  isCalculative: z.literal(false),
  operation: z.literal("subtraction"),
  includeShift: z.string().optional().default(""),
  firstAttribute: z.object({}).optional().default({}),
  secondAttribute: z.object({}).optional().default({}),
});

const DateRelativeMetaSchema = z.object({
  renderformat: z.enum([
    "Relative timestamp w.r.t created time",
    "Relative timestamp w.r.t EOD time",
  ]),
  includetime: z.boolean().default(true),
  timeformat: z.enum(["12", "24"]).default("24"),
  isRelative: z.literal(true),
  isCalculative: z.literal(false),
  operation: z.literal("subtraction"),
  includeShift: z.string().optional().default(""),
  firstAttribute: z.object({}).optional().default({}),
  secondAttribute: z.object({}).optional().default({}),
});

// Enumeration option schema
const EnumerationOptionSchema = z.object({
  slug: z.string().describe("Unique slug for the option"),
  display_name: z.string().describe("Display name for the option"),
  color: z.string().describe("Color for the option (e.g., #80BF8B)"),
  rank: z.number().describe("Rank/order of the option"),
});

// Attribute meta schema
const AttributeMetaSchema = z.object({
  // Enumeration specific
  is_color: z.boolean().optional(),
  options: z.array(EnumerationOptionSchema).optional().describe("Array of enumeration options with slug, display_name, color, and rank"),
  is_dynamic: z.boolean().optional(),

  // Number specific
  abbreviation: z.boolean().optional(),
  thousands_separator: z.boolean().optional(),
  currency: z.boolean().optional(),
  currency_symbol: z
    .enum(["₹", "$", "€", "¥", "£", "A$", "C$", "₣", "kr", "₽", "₩"])
    .optional(),
  decimal_places: z.enum(["1.0", "2.00", "3.000", "4.0000", "5.00000"]).optional(),

  // Formula
  is_formula: z.boolean().optional(),
  formula: z.string().optional(),

  // Autocorrection
  is_autocorrection: z.boolean().optional(),
  autocorrection_attribute: z.string().optional(),
  autocorrection_object: z.string().optional(),

  // Validation
  is_validation: z.boolean().optional(),
  regex: z.string().optional(),
  message: z.string().optional(),
  validation_suggestion: z.enum([
    "pancard",
    "aadhar",
    "vehicle",
    "mobile",
    "alphaAndnum",
    "alpha",
    "email",
    "url",
    "decimal",
    "number",
  ]).optional().describe("Preset validation suggestion key"),

  // Related field configuration
  related_objects_configuration: z
    .array(
      z.object({
        parent: z.string().nullable(),
        attributes: z.array(z.string()),
        object_slug: z.string(),
        source_attribute: z.string().optional(),
      })
    )
    .optional(),
});

// Main AttributeV2 Schema
export const CreateAttributeV2Schema = z.object({
  baseUrl: z.string().url().describe("The base URL of the backend system"),
  tenantName: z.string().describe("The tenant name"),
  appId: z.string().describe("Application ID for app-level attributes"),
  attributes: z
    .array(
      z.object({
        display_name: z.string().describe("Display name of the attribute"),
        key: z.string().describe("Unique key for the attribute"),
        data_type: z
          .enum([
            "text",
            "enumeration",
            "date",
            "boolean",
            "number",
            "media",
            "map",
            "user",
            "segment",
            "related_field",
          ])
          .describe("Data type of the attribute"),
        component_type: z
          .enum([
            "string",
            "text",
            "enumeration",
            "date",
            "boolean",
            "number",
            "media",
            "map",
            "user",
            "segment",
            "related_field",
          ])
          .describe("Component type (usually matches data_type)"),
        component_subtype: z.string().optional().describe("Specific subtype based on data_type (not required for date type)"),

        // Boolean flags
        is_required: z.boolean().optional().default(false),
        is_unique: z.boolean().optional().default(false),
        is_editable: z.boolean().optional().default(true),
        is_encrypted: z.boolean().optional().default(false),
        is_auditable: z.boolean().optional().default(false),
        searchable: z.boolean().optional().default(false),
        is_disabled: z.boolean().optional().default(false),
        hide: z.boolean().optional().default(false),

        // Default value
        default_value: z.string().optional().default(""),

        // Metadata (for date type)
        meta_data: z
          .union([
            DateCalculativeMetaSchema,
            DateAbsoluteMetaSchema,
            DateRelativeMetaSchema,
            z.object({}),
          ])
          .optional()
          .default({}),

        // Attribute meta
        attribute_meta: AttributeMetaSchema.optional().default({}),
      })
    )
    .describe("Array of attributes to create with V2 structure"),
});

// Type exports
export type CreateAttributeV2Input = z.infer<typeof CreateAttributeV2Schema>;
export type AttributeMetaV2 = z.infer<typeof AttributeMetaSchema>;
export type EnumerationOption = z.infer<typeof EnumerationOptionSchema>;
export type DateMetaV2 = z.infer<typeof DateCalculativeMetaSchema> |
                         z.infer<typeof DateAbsoluteMetaSchema> |
                         z.infer<typeof DateRelativeMetaSchema>;

// Helper function to validate component subtype
export function validateComponentSubtype(dataType: string, componentSubtype: string): boolean {
  const validSubtypes = COMPONENT_SUBTYPE_MAP[dataType as keyof typeof COMPONENT_SUBTYPE_MAP];
  return validSubtypes ? (validSubtypes as readonly string[]).includes(componentSubtype) : false;
}

// Helper function to get validation preset
export function getValidationPreset(presetKey: string) {
  return VALIDATION_OPTIONS.find(v => v.key === presetKey);
}

// Export constants for use in handler
export { COMPONENT_SUBTYPE_MAP, VALIDATION_OPTIONS };
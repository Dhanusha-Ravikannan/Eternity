import { z } from "zod";

// Base schema
export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Customer name is required to save" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Invalid name. Only letters and spaces allowed",
    }),

phoneNumber: z
  .string()
  .trim()
  .regex(/^[0-9]+$/, { message: "Phone number is required to save" })
  .length(10, { message: "Phone number must be exactly 10 digits" }),

  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" })
    .optional()
    .or(z.literal("")), // allow empty string as optional
  address: z.string().trim().optional().or(z.literal("")),

  balance: z
  .string()
  .trim()
  .optional()
  .or(z.literal("")) // allow empty string explicitly
  .refine((val) => val === "" || !isNaN(Number(val)), {
    message: "Balance must be a number",
  })
  .transform((val) => (val === "" ? null : Number(val))), 


});

/**
 * Validate customer input with duplicate checks
 * @param {Object} data - The customer input
 * @param {Array} existingCustomers - List of current customers
 * @param {number|null} editIndex - Index being edited (to skip duplicate check on same row)
 */
export const validateCustomer = (data, existingCustomers, editIndex = null) => {
  // Step 1: Validate fields with schema
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Step 2: Check for duplicates
  const { name, phoneNumber, email } = parsed.data;

  const isDuplicateName = existingCustomers.some(
    (cust, idx) =>
      cust.name.toLowerCase() === name.toLowerCase() && idx !== editIndex
  );
  if (isDuplicateName) {
    return { success: false, error: "Customer name already exists" };
  }

  const isDuplicatePhone = existingCustomers.some(
    (cust, idx) => cust.phoneNumber === phoneNumber && idx !== editIndex
  );
  if (isDuplicatePhone) {
    return { success: false, error: "Phone number already exists" };
  }

  if (email) {
    const isDuplicateEmail = existingCustomers.some(
      (cust, idx) => cust.email === email && idx !== editIndex
    );
    if (isDuplicateEmail) {
      return { success: false, error: "Email already exists" };
    }
  }

  return { success: true, data: parsed.data };
};

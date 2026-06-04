import { z } from "zod";

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional(),
);

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters")
    .regex(/[A-Z]/, "New password must contain an uppercase letter")
    .regex(/[0-9]/, "New password must contain a number")
    .regex(/[^A-Za-z0-9]/, "New password must contain a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional(),
});

export const AddressSchema = z.object({
  label: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).max(50).optional().default("Home"),
  ),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().min(8).max(20),
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(100).optional(),
  ),
  postalCode: z.string().min(4).max(10),
  country: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(2).max(100).default("Morocco"),
  ),
  isDefault: z.boolean().optional().default(false),
});

export const ProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(200),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Invalid price"),
  comparePrice: optionalPositiveNumber,
  sku: optionalTrimmedString,
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0).default(5),
  brand: optionalTrimmedString,
  movement: optionalTrimmedString,
  caseSize: optionalTrimmedString,
  caseMaterial: optionalTrimmedString,
  waterResist: optionalTrimmedString,
  strapMaterial: optionalTrimmedString,
  badge: optionalTrimmedString,
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  soldCount: z.coerce.number().int().min(0).optional().default(0),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  categoryId: optionalTrimmedString,
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+212|0)[\s.-]?\d(?:[\s.-]?\d){8}$/, "Numéro de téléphone invalide");

export const DEPOSIT_METHOD_VALUES = ["BANK_TRANSFER", "CASHPLUS", "WAFACASH"] as const;

export const CheckoutSchema = z.object({
  addressId: z.string().min(1, "Adresse requise"),
  phone: phoneSchema,
  method: z.enum(DEPOSIT_METHOD_VALUES),
  notes: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(500).optional(),
  ),
  promoCode: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(50).optional(),
  ),
});

export const SubmitDepositSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(DEPOSIT_METHOD_VALUES),
});

export const ReviewDepositSchema = z.object({
  orderId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT"]),
  adminNote: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(500).optional(),
  ),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "AWAITING_DEPOSIT",
    "DEPOSIT_PENDING",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  adminNote: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(500).optional(),
  ),
});

export const CancelOrderSchema = z.object({
  orderId: z.string().min(1),
  reason: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().max(500).optional(),
  ),
});

export const ReservationSchema = z.object({
  productId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const ReviewReservationSchema = z.object({
  reservationId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(500).optional(),
});

export const NotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(2).max(120),
  message: z.string().min(5).max(1000),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type ReservationInput = z.infer<typeof ReservationSchema>;

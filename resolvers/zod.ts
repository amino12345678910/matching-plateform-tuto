import {z} from 'better-auth';

// --- ZOD SCHEMA DEFINITION (Schema for validation) ---
const PackageSchema = z.object({
  price: z.preprocess(
    a => parseFloat(a as string),
    z.number().min(5, 'Price must be at least $5.').positive()
  ),
  delivery: z.preprocess(
    a => parseInt(a as string, 10),
    z.number().min(1, 'Delivery must be at least 1 day.').int()
  ),
  revisions: z.preprocess(
    a => parseInt(a as string, 10),
    z.number().min(0, 'Revisions cannot be negative.').int()
  ),
  description: z.string().min(10, 'Package description is required.'),
});

const formSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters.')
    .max(70, 'Title must not exceed 70 characters.'),
  description: z.string().min(50, 'Description must be at least 50 characters.'),

  // Category is handled manually with useState, but we validate it upon submission
  // category: z.string().min(1, 'Category selection is required.'),

  tags: z.string().max(100, 'Tags string is too long.'), // Further processing (splitting by comma) can be done in onSubmit

  // Nesting package validation
  basicPackage: PackageSchema,
  standardPackage: PackageSchema,
  premiumPackage: PackageSchema,

  // NOTE: Image handling (MultipleImageUpload) is typically done outside react-hook-form
  // and attached to the main form data in the onSubmit handler.
});

export {formSchema, PackageSchema};

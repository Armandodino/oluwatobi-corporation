import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().min(1, 'L\'email est requis').email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Product schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Le nom du produit est requis').max(200, 'Le nom est trop long'),
  slug: z.string().max(250, 'Le slug est trop long').optional(),
  description: z.string().max(5000, 'La description est trop longue').optional(),
  price: z.string().min(1, 'Le prix est requis').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Prix invalide'),
  salePrice: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'Prix promo invalide'),
  sku: z.string().max(100, 'SKU trop long').optional(),
  stock: z.string().optional().refine((val) => !val || !isNaN(parseInt(val)), 'Stock invalide'),
  image: z.string().max(2000, 'URL trop longue').optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  featured: z.boolean().optional(),
  weight: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), 'Poids invalide'),
  dimensions: z.string().max(100, 'Dimensions trop longues').optional(),
  brand: z.string().max(100, 'Marque trop longue').optional(),
  active: z.boolean().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Category schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis').max(100, 'Le nom est trop long'),
  slug: z.string().max(150, 'Le slug est trop long').optional(),
  description: z.string().max(500, 'La description est trop longue').optional(),
  image: z.string().max(2000, 'URL trop longue').optional(),
  parentId: z.string().max(100, 'ID parent trop long').optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Order schemas
export const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
});

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// schemas.ts
import { z } from "zod";

// Define the Zod schema for startup creation validation
export const linkSchema = z.record(z.string().url("Must be a valid URL").optional());

export const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().min(1, "Goal description is required"),
  completed: z.boolean().default(false),
});

export const startupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  logo: z.string().url("Logo must be a valid URL").or(z.literal('')),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  links: z.object({
    website: z.string().url("Website must be a valid URL").or(z.literal('')),
    twitter: z.string().url("Twitter link must be a valid URL").or(z.literal('')),
  }).and(linkSchema),
  investmentGoal: z.object({
      amount: z.number().min(1, "Amount must be greater than 0"),
      raised: z.number().min(0, "Raised must be greater than or equal to 0"),
      currency: z.string().min(3, "Currency must be at least 3 characters")
  }),
  equityoffered: z.object({
    amount: z.number().min(0, "Amount must be greater than or equal to 0")
  })
});

// This adds an id field derived from the name field
export const completeStartupSchema = startupSchema.transform((data) => ({
  ...data,
  id: data.name.toLowerCase().replace(/\s+/g, '-')
}));

export type StartupFormData = z.infer<typeof startupSchema>;
export type CompletedStartupData = z.infer<typeof completeStartupSchema>;

// Function to validate and create startup
export const validateAndCreateStartup = async (formData: unknown): Promise<{ success: boolean; data?: CompletedStartupData; errors?: string[] }> => {
  try {
    // Parse and validate the form data
    const validatedData = completeStartupSchema.parse(formData);
    
    // In a real app, this would store to a database or API
    localStorage.setItem(`startup-${validatedData.id}`, JSON.stringify(validatedData));
    console.log(`Created startup: ${validatedData.name}`);
    
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Extract and format validation errors
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error("Validation errors:", errors);
      return { success: false, errors };
    }
    
    console.error("Unknown error during validation:", error);
    return { success: false, errors: ["An unexpected error occurred"] };
  }
};

// Function to integrate with the form component
export const useStartupForm = () => {
  const createStartup = async (formData: StartupFormData) => {
    const result = await validateAndCreateStartup(formData);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.errors };
    }
  };
  
  return { createStartup };
};
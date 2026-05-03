import { z } from "zod";

const trimmedNonEmpty = (maxLength: number) => z.string().trim().min(1, "This field is required.").max(maxLength);
const nullableText = (maxLength: number) => z.string().trim().max(maxLength).optional().nullable();

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(320);
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters.").max(128, "Password is too long.");
export const routeIdSchema = z.uuid();
export const memberRoleSchema = z.enum(["admin", "member"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const signupSchema = z.object({
  name: trimmedNonEmpty(120),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const createProjectSchema = z.object({
  name: trimmedNonEmpty(120),
  description: nullableText(1000),
});

export const updateProjectSchema = createProjectSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one project field is required",
});

export const addMemberSchema = z.object({
  email: emailSchema,
  role: memberRoleSchema.default("member"),
});

export const updateMemberSchema = z.object({
  role: memberRoleSchema,
});

export const dueDateSchema = z.coerce.date();

export const createTaskSchema = z.object({
  title: trimmedNonEmpty(160),
  description: nullableText(2000),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  assigneeId: routeIdSchema.optional().nullable(),
  dueDate: dueDateSchema.optional().nullable(),
});

export const updateTaskSchema = z
  .object({
    title: trimmedNonEmpty(160).optional(),
    description: nullableText(2000),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assigneeId: routeIdSchema.optional().nullable(),
    dueDate: dueDateSchema.optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one task field is required" });

export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  assigneeId: routeIdSchema.optional(),
  dueBefore: dueDateSchema.optional(),
});

export type MemberRole = z.infer<typeof memberRoleSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

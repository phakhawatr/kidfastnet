import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(255, 'อีเมลต้องไม่เกิน 255 ตัวอักษร'),
  password: z
    .string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
});

// Signup validation schema
export const signupSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อเล่น')
    .max(50, 'ชื่อเล่นต้องไม่เกิน 50 ตัวอักษร'),
  age: z
    .string()
    .min(1, 'กรุณาเลือกอายุ'),
  grade: z
    .string()
    .min(1, 'กรุณาเลือกชั้นเรียน'),
  avatar: z
    .string()
    .min(1, 'กรุณาเลือกตัวการ์ตูน'),
  learningStyle: z
    .string()
    .min(1, 'กรุณาเลือกสไตล์การเรียน'),
  parentEmail: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกอีเมลผู้ปกครอง')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(255, 'อีเมลต้องไม่เกิน 255 ตัวอักษร'),
  parentPhone: z
    .string()
    .regex(/^(08[0-9]|09[0-9]|06[0-9])-[0-9]{3}-[0-9]{4}$/, 'รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)'),
  password: z
    .string()
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'กรุณายอมรับข้อกำหนดและเงื่อนไข'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

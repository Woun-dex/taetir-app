import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { signupUser } from '@/services/authService';
import { useAuth } from '@/hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChalkboardTeacher , IconSchool} from "@tabler/icons-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"



const FormSchema = z.object({
    username: z.string().min(1, {
      message: "Username is required",
    }),
    email: z.string().email({
        message: "Enter a valid email",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    rememberMe: z.boolean(),
}).refine(
    (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export function AuthForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe : false,
    },
  })
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try{
      const { username ,email, password  } = data;
      const res = await signupUser(username, email, password)

      navigate("/signin");
    }catch (error : any) {
      console.error("Login failed:", error);
      Error(error.response?.data?.message || "Login failed");
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
       <div className='flex flex-col mx-auto gap-4 '>
         <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="*********" type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="*******" type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex items-center justify-between  '>
         

        </div>
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
                <FormItem className="flex items-center justify-between mt-4">
                <Label className="flex items-center gap-2">
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                    Remember me
                </Label>
                </FormItem>
            )}
            />
        <Button type="submit" className='dark:bg-black/30 dark:text-gray-300'>Submit</Button>
        </div>
      </form>
      
    </Form>
  )
}
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';  
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '@/services/authService';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const FormSchema = z.object({
   password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
}).refine(
    (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });



const ChangePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const token = location.state?.token || '';

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  })
  function onSubmit(data: z.infer<typeof FormSchema>) {
    resetPassword(email, data.password)
      .then((response) => {
        alert("Password changed successfully.");
        navigate('/signin'); 
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        alert("Failed to change password. Please try again.");
      });

  }
  return (
    <Card className='w-full w-96' >
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <p className='text-xs'>Enter your new password below.</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} >
            <div className='flex flex-col mx-auto gap-3 '>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>password</FormLabel>
                    <FormControl>
                      <Input placeholder="*********" type='password' className='text-xs'{...field} />
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
                    <FormLabel className='text-xs'>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="*********" type='password' className='text-xs' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex items-center justify-between  '>
              </div>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ChangePassword
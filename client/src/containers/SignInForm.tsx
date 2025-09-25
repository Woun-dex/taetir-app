import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { loginUser } from '@/services/authService';
import { useAuth } from '@/hooks/AuthContext';
import { useNavigate } from 'react-router-dom'; 

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useEffect } from 'react';


const FormSchema = z.object({
    email: z.string().email({
        message: "Enter a valid email",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters long"
    }),
    rememberMe: z.boolean(),
});

export function SignInForm() {
  //const { login, profile } = useAuth();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {

    try{

    const { email, password } = data;
  
    const res = await loginUser(email, password);
    if (!res) return;
    console.log(res);
   
    if (res.user.role === null) {
      navigate('/choose-role' , { state: { user : res.user } });
      return;
    }
    navigate('/dashboard');
    }catch (error : any) {
      console.error("Login failed:", error);
      form.setError("email", { message: error.message });
    }

  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
       <div className='flex flex-col mx-auto gap-4 '>
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
        <div className='flex items-center justify-between m-4 '>
         <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
                <FormItem className="flex items-center justify-between">
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

        <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
          Forgot password?
        </a>

        </div>
        <Button type="submit" className='dark:bg-black/30 dark:text-gray-300'>Submit</Button>
        </div>
      </form>
      
    </Form>
  )
}
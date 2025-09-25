import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/services/authService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';




const ForgotPassword = () => {
    const [ email , setEmail ] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = () => { 
        if ( email !== '' ) {
            forgotPassword(email)
                .then((response) => {
                    alert("Password reset link sent to your email.");
                    navigate('/otp', { state: { email } }); 
                })
                .catch((error) => {
                    console.error("Error sending password reset link:", error);
                    alert("Failed to send password reset link. Please try again.");
                });
            
        }
    }
  return (
    <div>
      <Card className='w-full mx-auto w-96 mt-20'>
        <CardHeader>
          <CardTitle className='text-lg font-bold'>Forgotten your password?</CardTitle>
          <p className='text-xs text-gray-400'>There is nothing to worry about, we'll send you a message to help you reset your password.</p>
        </CardHeader>
        <CardContent>
          <Label htmlFor="email" className="mb-2 text-xs text-gray-500">Email Address</Label>
          <Input placeholder="Enter your email" className='text-sm' value={email} onChange={(e) => setEmail(e.target.value)} />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className='w-full text-sm' onClick={handleResetPassword}>Reset Password</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPassword
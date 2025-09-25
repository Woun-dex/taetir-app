import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import { verifyOtp } from '@/services/authService'; 

function isNumeric(val : any) {
  return Number(val) == val;
}

const OtpPage = () => {

    const [otp, setOtp] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email ||  '';

    const handleSubmit = () => {
        if (otp.length === 6 && otp.split('').every(isNumeric)) {
            if (!email) {
                alert("Email not found. Please request a new OTP.");
                return;
            }
            verifyOtp(email, otp)
                .then((response) => {
                    alert("OTP verified successfully.");
                    navigate('/reset-password' , { state: { email : email  } });
                })
                .catch((error) => {
                    console.error("Error verifying OTP:", error);
                    alert("Failed to verify OTP. Please try again.");
                });
        } else {
            console.error("Please enter a valid 6-digit OTP");
        }
    }

    return (
      <div>
        <Card className='w-full mx-auto w-96 mt-20'>
          <CardHeader>
            <CardTitle className='text-lg font-bold'>OTP Verification</CardTitle>
            <p className='text-xs text-gray-400'>Please enter the 6-digit OTP sent to your email.</p>
          </CardHeader>
          <CardContent className='flex justify-center'>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
          </CardContent>
          <CardFooter className="flex flex-col justify-center gap-3">
            <Button className='w-full text-sm' onClick={handleSubmit}>Verify OTP</Button>
            <a href="" className='text-xs text-gray-500'>send a code again</a>
          </CardFooter>
        </Card>
      </div>
    )
}

export default OtpPage
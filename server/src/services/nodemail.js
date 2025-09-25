import sendgrid from '@sendgrid/mail';
import dotenv from 'dotenv';


dotenv.config();
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOTPEmail = async (email, otp) => {
   const msg = {
        to: email,
        from: 'walidelabad@gmail.com',
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
        html: `
                <div style="background-color: #f4f4f7; padding: 20px; font-family: sans-serif;">
                <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; border: 1px solid #ddd; overflow: hidden;">
                    <div style="background-color: #001f3f; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">TAETIR</h1>
                    </div>
                    <div style="padding: 30px; text-align: center; color: #333;">
                    <h2 style="font-size: 24px; color: #001f3f; margin-top: 0;">Password Reset Request</h2>
                    <p style="font-size: 16px; line-height: 1.5;">You requested a password reset. Please use the code below to complete the process.</p>
                    <div style="margin: 30px 0;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Your verification code is:</p>
                        <div style="background-color: #f0f4f8; border-radius: 8px; padding: 15px 20px; display: inline-block;">
                        <strong style="font-size: 28px; color: #001f3f; letter-spacing: 5px;">${otp}</strong>
                        </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #888;">If you did not request a password reset, you can safely ignore this email.</p>
                    </div>
                </div>
                </div>
            `,
}
sendgrid
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
}
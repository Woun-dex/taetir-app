
import bcrypt from 'bcrypt';
import redisClient from '../config/redis.js';

export const StoreOTP = async (email, otp) => { 
    try {
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        await redisClient.set(email, hashedOtp, { EX: 600 }); 
        
        return true;
    } catch (error) {
        console.error("Error storing OTP:", error);
        return false;
    }
}


export const VerifyOTP = async (email, otp) => {
    try {
        const storedOtpHash = await redisClient.get(email);
        
        if (!storedOtpHash) {
            return false; 
        }

        const isMatch = await bcrypt.compare(otp, storedOtpHash);
        
        if (isMatch) {
            await redisClient.del(email); 
            return true;
        }

        return false; 
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return false;
    }
}

import {SignInForm as AuthForm} from '@/containers/SignInForm'
import { Link } from 'react-router-dom'
import googlesvg from '@/assets/google.svg'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/axios'



  const SigninPage = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
  
  
  

  return (
    <div className="min-h-screen w-xl flex items-center justify-center">
      <Card className='w-full mx-auto'>
        <CardHeader>
          <h1 className="bg-linear from-blue-900 to-blue-700 bg-clip-text text-3xl font-extrabold text-transparent text-center">
              TAETIR
          </h1>
          <CardTitle className="text-center">Welcome Back</CardTitle>
            <p className="text-center text-xs">Please sign in to continue</p>
        </CardHeader>
        <CardContent>
          <div className='mx-auto'>
              <AuthForm />
          </div>
          <div className="flex items-center my-3">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-3 text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center flex-col items-center gap-3">
          <div id="google-login" className="flex justify-center mb-2"></div>
          <div className="flex-grow h-px bg-gray-300" />
          <Link to="http://localhost:5000/api/auth/google" className="w-full">
          <Button  className="w-full bg-white  text-gray- dark:bg-black/30 dark:text-gray-300 hover:bg-gray-100">
            <img src={googlesvg} width={18} alt="Google logo" />
            Sign up with Google
          </Button>

          </Link>
          <p className="text-sm text-gray-500">
            Don't have an account? 
            <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
            </Link>
          </p>

          


        </CardFooter>
      </Card>
    </div>
  ) 
}

export default SigninPage
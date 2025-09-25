import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChalkboardTeacher , IconSchool} from "@tabler/icons-react"
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate , useLocation} from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import { chooseRole } from '@/services/authService';

const ChooseRole = () => {

    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = location.state || {};

    const submitRole = () => {
       
        if (role) {

                navigate('/complete-setup' , { state : {role : role , user : user} })

        } else {
            console.error('Please select a role before proceeding.');
        }
    }

  return (
    <Card className='w-xl'>
        <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Choose Your Role</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center gap-4">
            <Button variant="outline" className={`w-42 h-32 flex flex-col hover:bg-gray-50 ${role === 'mentor' ? 'bg-blue-800 dark:bg-blue-900  text-white hover:bg-blue-900' : ''}`} onClick={() => setRole('mentor')}>
                <IconChalkboardTeacher className="mr-2" size={24} />
                Mentor
            </Button>
            <Button variant="outline" className={`w-42 h-32 flex flex-col hover:bg-gray-50 ${role === 'mentee' ? 'bg-blue-800 dark:bg-blue-900  text-white hover:bg-blue-900' : ''}`} onClick={() => setRole('mentee')}>
                <IconSchool className="mr-2" size={24} />
                Mentee
            </Button>
        </CardContent>
        <CardFooter className="text-center flex justify-center">
            <Button onClick={submitRole} className='dark:bg-blue-900 dark:text-white'> Let's Start The Journey</Button>
        </CardFooter>
    </Card>
  )
}

export default ChooseRole
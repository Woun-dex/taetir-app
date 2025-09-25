import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "@/utils/axios"; 

// --- Type Definitions ---

export interface User {
  id: string;
  email: string;
  username?: string | null;
  role?: 'mentor' | 'mentee' | null;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  avatar_url?: string |null;
  title?: string | null;
}


export interface MentorProfile {
    id: string;
    profile_id: string;
    professional_experience?: string | null;
    availability?:string|null;
    company?: string | null;
    skill?: string[] | [];
}

export interface MenteeProfile {
    id: string;
    profile_id: string;
    learning_objectives?: string | null;

}


interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roleProfile: MentorProfile | MenteeProfile | null; // <-- ADDED
  login: (userData: User, profileData: Profile | null, roleProfileData: any | null) => void; // <-- UPDATED
  logout: () => void;
  loading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleProfile, setRoleProfile] = useState<MentorProfile | MenteeProfile | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  const checkUserSession = async () => {
    setLoading(true);
    try {

      const response = await api.get('/auth/current_user'); 

      const { user, profile, roleProfile } = response.data; 
 
      setUser(user);
      setProfile(profile);
      setRoleProfile(roleProfile);

    } catch (error) {
      console.log("No active session found.");
      setUser(null);
      setProfile(null);
      setRoleProfile(null); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);


  const login = (userData: User, profileData: Profile | null, roleProfileData: any | null) => {
    setUser(userData);
    setProfile(profileData);
    setRoleProfile(roleProfileData); 
  };


  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error("Error during server logout:", error);
    } finally {
      setUser(null);
      setProfile(null);
      setRoleProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, roleProfile, login, logout, loading, refetchUser: checkUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

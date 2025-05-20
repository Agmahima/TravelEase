"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RegisterForm } from '@/components/AuthForms';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';

const Register = () => {
  const { user, registerMutation, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    document.title = 'Create Account - TravelEase';
    
    // Redirect if already logged in
    if (!isLoading && user) {
    //   navigate('/dashboard');
    router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  const handleRegister = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container max-w-md p-4">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your details to create your TravelEase account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm onRegister={handleRegister} />
              {registerMutation.isPending && (
                <div className="text-center mt-4 text-primary">
                  Creating your account...
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                Already have an account?{' '}
                <Link href="/login">
                  <span className="text-primary font-medium hover:underline cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;

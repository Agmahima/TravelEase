"use client";
import { useEffect } from 'react';
// import { Link,  } from 'wouter';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoginForm } from '@/components/AuthForms';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';

const Login = () => {
  const { user, isLoading, loginMutation } = useAuth();
const router = useRouter();
  
  useEffect(() => {
    document.title = 'Sign In - TravelEase';
    
    // Redirect if already logged in
    if (!isLoading && user) {
    //   navigate('/dashboard');
    router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  const handleLogin = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="container max-w-md p-4">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm onLogin={handleLogin} />
              {loginMutation.isPending && (
                <div className="text-center mt-4 text-primary">
                  Signing in...
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-gray-500">
                Don't have an account?{' '}
                <Link href="/register">
                  <span className="text-primary font-medium hover:underline cursor-pointer">
                    Create an account
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

export default Login;

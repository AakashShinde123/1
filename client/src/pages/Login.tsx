import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
// Removed Card imports for sketch design
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, LogIn, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we're in local development - disable bypass since we have proper keys now
  const isLocalDevelopment = false; // Disabled since we have proper reCAPTCHA keys
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData & { captchaToken: string }) => {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/login", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Login successful",
      });
      window.location.href = "/";
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginFormData) => {
    // Skip CAPTCHA verification for local development
    if (!isLocalDevelopment && (!captchaVerified || !captchaToken)) {
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ ...data, captchaToken: captchaToken || 'localhost-bypass' });
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setCaptchaVerified(!!token);
  };

  return (
    <div className="min-h-screen bg-gray-50 paper-texture flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-20 w-40 h-40 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-indigo-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-purple-800 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="sketch-card sketch-card-purple p-0 overflow-hidden">
          <div className="text-center pb-6 pt-8 px-8">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-20 animate-pulse"></div>
                <img 
                  src="/assets/111_1750417572953.png" 
                  alt="Sudhamrit Logo" 
                  className="h-20 w-auto mx-auto relative z-10"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-purple-800 sketch-underline">
              Sudhamrit
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Secure Access Portal</p>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your username"
                          className="text-lg h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                          {...field}
                        />
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
                      <FormLabel className="text-gray-700 font-semibold flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-purple-600" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="text-lg h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

{/*                 CAPTCHA - Only show in production */}
                {!isLocalDevelopment && (
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={onCaptchaChange}
                      theme="light"
                    />
                  </div>
                )}
                
{/*                 Local development notice */}
                {isLocalDevelopment && (
                  <div className="flex justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
{/*                       🔧 Local Development Mode - CAPTCHA disabled */}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit"
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  size="lg"
                  disabled={isLoading || (!isLocalDevelopment && !captchaVerified)}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Secure Login
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center text-sm text-purple-800">
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-medium">Secured with end-to-end encryption</span>
              </div>
            </div>

            {/* Registration Section */}
            <div className="mt-6 text-center">
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">New User?</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              <Link href="/register">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold py-3 rounded-lg transition-all duration-200"
                >
                  Create New Account
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 mt-2">
                Register now and wait for admin approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

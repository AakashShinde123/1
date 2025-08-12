import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Link } from "wouter";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Register() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Check if we're in local development
  const isLocalDevelopment = import.meta.env.DEV || !import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [captchaVerified, setCaptchaVerified] = useState(isLocalDevelopment);
  const [captchaToken, setCaptchaToken] = useState<string | null>(isLocalDevelopment ? 'localhost-bypass' : null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData & { captchaToken: string }) => {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/register", {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        captchaToken: data.captchaToken,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Please wait for an admin to assign your role before you can log in.",
      });
      form.reset();
      setIsLoading(false);
      // Redirect to login page after successful registration
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: RegistrationFormData) => {
    // Skip CAPTCHA verification for local development
    if (!isLocalDevelopment && (!captchaVerified || !captchaToken)) {
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ ...data, captchaToken: captchaToken || 'localhost-bypass' });
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
            <p className="text-gray-600 mt-2 font-medium">Create Your Account</p>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="First name"
                              className="pl-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Last name"
                              className="pl-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Enter your username"
                            className="pl-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10 sketch-input bg-white border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                {/* CAPTCHA - Only show in production */}
                {!isLocalDevelopment && (
                  <div className="flex justify-center pt-2">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={onCaptchaChange}
                      theme="light"
                    />
                  </div>
                )}
                
                {/* Local development notice */}
                {isLocalDevelopment && (
                  <div className="flex justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      🔧 Local Development Mode - CAPTCHA disabled
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || (!isLocalDevelopment && !captchaVerified)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 sketch-button"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <Link href="/login">
                    <button className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </button>
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

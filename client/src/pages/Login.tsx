import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, LogIn, Lock, Eye, EyeOff, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Check if we're in local development
  const isLocalDevelopment = import.meta.env.DEV || !import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [captchaVerified, setCaptchaVerified] = useState(isLocalDevelopment);
  const [captchaToken, setCaptchaToken] = useState<string | null>(isLocalDevelopment ? 'localhost-bypass' : null);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-5 relative overflow-hidden">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          }
          .logo-icon {
            animation: float 3s ease-in-out infinite;
          }
          .form-input:focus {
            transform: translateY(-1px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.15), 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .login-btn {
            position: relative;
            overflow: hidden;
          }
          .login-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          .login-btn:hover::before {
            left: 100%;
          }
          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
          }
        `}
      </style>

      <div className="w-full max-w-md relative">
        <div className="glass-card relative rounded-2xl shadow-2xl p-10 overflow-hidden">
          {/* Logo and Header Section */}
          <div className="text-center mb-10">
            <div className="logo-icon w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
              Sudhamrit
            </h1>
            <p className="text-gray-600 text-base">Inventory Management System</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block mb-2 text-gray-800 font-semibold text-sm">
                      Username or Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your username or email"
                        className="form-input w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-base bg-white transition-all duration-300 focus:border-indigo-500 focus:ring-0 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block mb-2 text-gray-800 font-semibold text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="form-input w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-xl text-base bg-white transition-all duration-300 focus:border-indigo-500 focus:ring-0 focus:outline-none"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors p-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        className="text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {rememberMe && <span className="text-white text-xs">✓</span>}
                  </label>
                </div>
                <label htmlFor="rememberMe" className="text-gray-700 text-sm cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              {/* CAPTCHA - Only show in production */}
              {!isLocalDevelopment && (
                <div className="flex justify-center mb-6">
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
                <div className="flex justify-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800 font-medium">
                    🔧 Local Development Mode - CAPTCHA disabled
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit"
                className="login-btn w-full px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden"
                disabled={isLoading || (!isLocalDevelopment && !captchaVerified)}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-6 text-gray-500 text-sm">Need Help?</span>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">
              Don't have an account?{" "}
              <Link href="/register">
                <button className="text-indigo-500 hover:text-indigo-600 font-medium hover:underline transition-colors">
                  Create account
                </button>
              </Link>
            </p>
           {/* ? */}
          </div>
        </div>
      </div>
    </div>
  );
}

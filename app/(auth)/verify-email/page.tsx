"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerificationIllustration } from "@/components/auth/illustrations";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const email = "user@example.com"; // TODO: Get from context or URL params

  async function handleResendEmail() {
    setIsResending(true);
    try {
      // TODO: Replace with actual API call
      console.log("Resending verification email to:", email);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setResendSuccess(true);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Resend email error:", error);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout illustration={<VerificationIllustration />}>
      <Card className="border-0 shadow-none bg-white">
        <CardHeader className="space-y-1">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification link to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-gray-600">
            Please check your email and click the verification link to activate your account.
          </p>
          
          {resendSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600 text-center">
                Verification email resent successfully!
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button
              className="w-full bg-primary"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? "Resending email..." : "Resend verification email"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-gray-600">
              Can&apos;t find the email?
            </p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Make sure {email} is correct</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact support if you need help</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
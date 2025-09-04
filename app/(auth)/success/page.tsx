"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SuccessIllustration } from "@/components/auth/illustrations";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "default";

  const getContent = () => {
    switch (type) {
      case "registration":
        return {
          title: "Registration Successful!",
          description: "Your account has been created successfully. You can now log in to access your dashboard.",
          buttonText: "Go to Login",
          buttonAction: () => router.push("/login"),
        };
      case "email-verified":
        return {
          title: "Email Verified!",
          description: "Your email has been verified successfully. You can now access all features of your account.",
          buttonText: "Go to Dashboard",
          buttonAction: () => router.push("/dashboard"),
        };
      case "password-changed":
        return {
          title: "Password Changed!",
          description: "Your password has been updated successfully. Please log in with your new password.",
          buttonText: "Go to Login",
          buttonAction: () => router.push("/login"),
        };
      case "profile-updated":
        return {
          title: "Profile Updated!",
          description: "Your profile information has been updated successfully.",
          buttonText: "Back to Profile",
          buttonAction: () => router.push("/profile"),
        };
      default:
        return {
          title: "Success!",
          description: "Your action has been completed successfully.",
          buttonText: "Continue",
          buttonAction: () => router.push("/dashboard"),
        };
    }
  };

  const content = getContent();

  return (
    <AuthLayout illustration={<SuccessIllustration />}>
      <Card className="border-0 shadow-none bg-white">
        <CardHeader className="space-y-1">
          <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{content.title}</CardTitle>
          <CardDescription className="text-center">
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-primary"
            onClick={content.buttonAction}
          >
            {content.buttonText}
          </Button>

          {type === "registration" && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">What&apos;s next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete your organization profile
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Invite team members and employees
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upload compliance documents
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Set up notification preferences
                </li>
              </ul>
            </div>
          )}

          {type === "email-verified" && (
            <div className="text-center text-sm text-gray-600">
              <p>You now have full access to all features.</p>
              <p className="mt-1">Thank you for verifying your email!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
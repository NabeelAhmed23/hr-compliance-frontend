"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerificationIllustration } from "@/components/auth/illustrations";

const verificationSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function TwoFactorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codeValues, setCodeValues] = useState(["", "", "", "", "", ""]);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newValues = [...codeValues];
    newValues[index] = value;
    setCodeValues(newValues);

    // Update form value
    form.setValue("code", newValues.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newValues = [...codeValues];
    
    digits.forEach((digit, i) => {
      if (i < 6) {
        newValues[i] = digit;
      }
    });
    
    setCodeValues(newValues);
    form.setValue("code", newValues.join(""));
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  async function onSubmit(data: VerificationFormValues) {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log("2FA verification code:", data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setIsResending(true);
    try {
      // TODO: Replace with actual API call
      console.log("Resending 2FA code");
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setResendSuccess(true);
      setResendTimer(30);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Resend code error:", error);
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">2-Step Verification</CardTitle>
          <CardDescription className="text-center">
            We sent a verification code to your registered phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2 justify-center">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <Input
                            key={index}
                            ref={(el) => {
                              inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg font-semibold"
                            value={codeValues[index]}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              {resendSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600 text-center">
                    Verification code resent successfully!
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={isLoading || codeValues.join("").length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend code in <span className="font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary hover:text-primary/80"
                    onClick={handleResendCode}
                    disabled={isResending}
                  >
                    {isResending ? "Resending..." : "Resend code"}
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-gray-600 mb-2">
                  Having trouble?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Try another verification method
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  acceptInviteSchema,
  type AcceptInviteFormData,
} from "@/lib/validations/auth";
import { useAcceptInviteEmail } from "@/lib/hooks/use-auth";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [showSuccess, setShowSuccess] = useState(false);

  const acceptInvite = useAcceptInviteEmail();

  const form = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token: token,
      password: "",
      confirmPassword: "",
    },
  });

  // Basic token validation
  if (!token || typeof token !== "string" || token.trim() === "") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-red-700">
                  Invalid Token
                </h2>
                <p className="text-muted-foreground">
                  The invitation link appears to be invalid or corrupted. Please
                  contact your administrator for a new invitation.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="mt-4"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: AcceptInviteFormData) => {
    try {
      await acceptInvite.mutateAsync(data);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      // Error is handled by the mutation
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-700">
                  Account Activated!
                </h2>
                <p className="text-muted-foreground">
                  Your password has been set successfully. Redirecting to
                  dashboard...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Accept Invitation</CardTitle>
          <CardDescription>
            Set your password to activate your account and get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acceptInvite.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {acceptInvite.error?.message ||
                  "Failed to accept invitation. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={acceptInvite.isPending}
              >
                {acceptInvite.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  "Set Password & Activate Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Password requirements:
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• At least 8 characters</li>
              <li>• One lowercase letter</li>
              <li>• One uppercase letter</li>
              <li>• One number</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

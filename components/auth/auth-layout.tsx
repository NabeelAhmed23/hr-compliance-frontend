interface AuthLayoutProps {
  children: React.ReactNode;
  illustration?: React.ReactNode;
}

export function AuthLayout({ children, illustration }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/80 to-primary items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-primary-foreground max-w-md">
          {illustration ? (
            illustration
          ) : (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">Welcome to HR Compliance</h1>
              <p className="text-lg opacity-90">
                Streamline your compliance and document management with our comprehensive platform.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
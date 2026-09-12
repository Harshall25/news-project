'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled UI crash caught by error boundary:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. An unexpected error has occurred and the application was unable to render this page.
          </p>
        </div>
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
      </div>
    </div>
  );
}

import type { ApiError } from "@/types";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function ErrorState({ error, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-red-500 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-gray-600 text-center mb-6">{error.message}</p>
      <div className="flex gap-4">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Spróbuj ponownie
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Wróć
          </Button>
        )}
      </div>
    </div>
  );
}

import type { ApiError } from "../../types";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function ErrorState({ error, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-8 h-8 text-red-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Wystąpił błąd</h3>

      <p className="text-red-500 mb-4">{error.message}</p>

      {error.errors && Object.entries(error.errors).length > 0 && (
        <ul className="list-disc list-inside text-sm text-gray-600 mb-6">
          {Object.entries(error.errors).map(([field, messages]) => (
            <li key={field} className="mb-1">
              <span className="font-medium">{field}:</span> {messages.join(", ")}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-4 mt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Wróć do dashboardu
          </Button>
        )}

        {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
      </div>
    </div>
  );
}

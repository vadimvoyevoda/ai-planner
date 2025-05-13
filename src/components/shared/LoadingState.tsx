interface LoadingStateProps {
  message?: string;
  "data-test-id"?: string;
}

export default function LoadingState({ message = "Ładowanie...", "data-test-id": dataTestId }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12" data-test-id={dataTestId}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

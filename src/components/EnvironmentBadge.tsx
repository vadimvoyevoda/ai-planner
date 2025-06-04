import { getEnvironmentName } from '@/lib/environment';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function EnvironmentBadge() {
  const [env, setEnv] = useState<string>('');
  
  useEffect(() => {
    setEnv(getEnvironmentName());
  }, []);

  // Determine badge color based on environment
  const getBadgeColorClass = () => {
    switch (env) {
      case 'prod':
        return 'bg-green-500 text-white';
      case 'integration':
        return 'bg-blue-500 text-white';
      case 'local':
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (!env) return null;

  return (
    <div className={cn('fixed top-0 right-0 m-2 px-2 py-1 rounded-md text-xs font-medium z-50', getBadgeColorClass())}>
      {env.toUpperCase()}
    </div>
  );
} 
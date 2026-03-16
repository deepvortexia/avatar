'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useFreeGenerations() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const { user, loading } = useAuth();
  
  const isLoggedIn = !loading && !!user;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const useFreeGeneration = (): boolean => {
    return isLoggedIn;
  };

  const restoreFreeGeneration = (): void => {};

  return {
    freeGenerationsLeft: 0,
    isLoggedIn,
    canGenerate: isLoggedIn,
    useFreeGeneration,
    restoreFreeGeneration,
    isClient,
  };
}

"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VerificationToastProps {
  status: 'success' | 'error' | 'invalid';
  message: string;
}

export default function VerificationToast({ status, message }: VerificationToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'success') {
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });
    } else if (status === 'error') {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } else if (status === 'invalid') {
      toast({
        title: "Invalid Link",
        description: message,
        variant: "destructive",
      });
    }
  }, [status, message, toast]);

  return null;
} 
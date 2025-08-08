// Hook personalizado para Supabase en Son D'licias

import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '../services/supabase';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const testConnection = async () => {
      setIsLoading(true);
      const result = await supabaseHelpers.testConnection();
      setIsConnected(result.success);
      setIsLoading(false);
    };
    
    testConnection();
  }, []);

  return {
    supabase,
    isConnected,
    isLoading,
    helpers: supabaseHelpers
  };
};

// Hook para subscripciones en tiempo real
export const useRealtimeSubscription = (table, callback) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table }, 
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, callback]);
};

export default useSupabase;
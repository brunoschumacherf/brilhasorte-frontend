import { useRef, useEffect } from 'react';

// Este hook retorna uma referência que diz se o componente está montado ou não.
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Quando o componente monta, a referência é true
    isMountedRef.current = true;
    
    // Quando o componente desmonta, a função de cleanup define a referência como false
    return () => {
      isMountedRef.current = false;
    };
  }, []); // O array vazio [] garante que isso rode apenas na montagem e desmontagem

  return isMountedRef;
};
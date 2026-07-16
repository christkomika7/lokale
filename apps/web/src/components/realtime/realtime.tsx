import { getRealtimeClient, type AppSocket } from "#/realtime/io";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface RealtimeContextValue {
  socket: AppSocket;
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

interface RealtimeProviderProps {
  url: string;
  getToken?: () => string | undefined;
  children: ReactNode;
  /** Ne connecte le socket que si true (ex: attends que la session Better Auth soit chargée) */
  enabled?: boolean;
}

export function RealtimeProvider({
  url,
  getToken,
  children,
  enabled = true,
}: RealtimeProviderProps) {
  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  if (!socketRef.current && enabled) {
    socketRef.current = getRealtimeClient({ url, getToken });
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [enabled]);

  if (!socketRef.current) {
    // Session pas encore prête : on ne rend rien de connecté, mais on ne
    // bloque pas le reste de l'app pour autant.
    return <>{children}</>;
  }

  return (
    <RealtimeContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error(
      "useRealtime() doit être utilisé à l'intérieur de <RealtimeProvider>.",
    );
  }
  return ctx;
}

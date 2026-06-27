import { useRef, useCallback } from 'react';

export type WsProgressEvent = {
  type: 'progress' | 'complete' | 'error' | 'heartbeat';
  audit_id: string;
  status: string;
  current_page: string;
  discovered_count: number;
  completed_count: number;
  current_agent: string;
  percent: number;
  estimated_time: string;
  error?: string;
};

type Handlers = {
  onProgress?: (evt: WsProgressEvent) => void;
  onComplete?: (evt: WsProgressEvent) => void;
  onError?: (evt: WsProgressEvent | { error: string }) => void;
};

const BACKEND_WS = 'ws://localhost:8000';
const MAX_RECONNECT = 3;
const RECONNECT_DELAY_MS = 1500;

export function useAuditWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const handlersRef = useRef<Handlers>({});

  const connect = useCallback((auditId: string, handlers: Handlers) => {
    handlersRef.current = handlers;
    reconnectCount.current = 0;

    const open = () => {
      const ws = new WebSocket(`${BACKEND_WS}/ws/audit/${auditId}`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const data: WsProgressEvent = JSON.parse(ev.data);
          if (data.type === 'progress' || data.type === 'heartbeat') {
            handlersRef.current.onProgress?.(data);
          } else if (data.type === 'complete') {
            handlersRef.current.onComplete?.(data);
            ws.close();
          } else if (data.type === 'error') {
            handlersRef.current.onError?.(data);
            ws.close();
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = (ev) => {
        // Reconnect on unexpected close (not clean close)
        if (!ev.wasClean && reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current++;
          setTimeout(open, RECONNECT_DELAY_MS * reconnectCount.current);
        }
      };
    };

    open();
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close(1000, 'Client disconnected');
    wsRef.current = null;
  }, []);

  return { connect, disconnect };
}

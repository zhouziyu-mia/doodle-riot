import type { BusMessage } from "@/types";

export interface Bus {
  post: (msg: BusMessage) => void;
  close: () => void;
}

interface Envelope {
  nonce: string;
  msg: BusMessage;
}

/**
 * 打开一个房间的跨标签页通信总线。
 * 优先使用 BroadcastChannel；不可用时回退到 localStorage + storage 事件。
 * 两种方式都不会把消息回传给发送方自己。
 */
export function openBus(code: string, onMessage: (msg: BusMessage) => void): Bus {
  const hasBC = typeof BroadcastChannel !== "undefined";

  if (hasBC) {
    const channel = new BroadcastChannel(`doodleriot.${code}`);
    channel.onmessage = (event: MessageEvent<BusMessage>) => {
      onMessage(event.data);
    };
    return {
      post: (msg) => channel.postMessage(msg),
      close: () => channel.close(),
    };
  }

  const storageKey = `doodleriot.bus.${code}`;
  const seen = new Set<string>();

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      const env = JSON.parse(event.newValue) as Envelope;
      if (seen.has(env.nonce)) return;
      seen.add(env.nonce);
      onMessage(env.msg);
    } catch {
      /* ignore */
    }
  };

  window.addEventListener("storage", onStorage);

  return {
    post: (msg) => {
      const env: Envelope = { nonce: makeNonce(), msg };
      seen.add(env.nonce);
      try {
        localStorage.setItem(storageKey, JSON.stringify(env));
      } catch {
        /* ignore */
      }
    },
    close: () => window.removeEventListener("storage", onStorage),
  };
}

function makeNonce(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

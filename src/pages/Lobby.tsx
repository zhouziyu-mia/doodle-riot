import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brush, Rocket } from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { BigTitle } from "@/components/landing/BigTitle";
import { SloganMarquee } from "@/components/landing/SloganMarquee";
import { NamePlate } from "@/components/landing/NamePlate";
import { HostPanel } from "@/components/landing/HostPanel";
import { JoinPanel } from "@/components/landing/JoinPanel";
import { HowToPlay } from "@/components/landing/HowToPlay";
import { DecorBackdrop } from "@/components/ui/DecorBackdrop";
import { ToastLayer } from "@/components/ui/ToastLayer";

export default function Lobby() {
  const profile = useRoomStore((s) => s.profile);
  const room = useRoomStore((s) => s.room);
  const toast = useRoomStore((s) => s.toast);
  const init = useRoomStore((s) => s.init);
  const rename = useRoomStore((s) => s.rename);
  const setAvatar = useRoomStore((s) => s.setAvatar);
  const createRoom = useRoomStore((s) => s.createRoom);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const enterRoom = useRoomStore((s) => s.enterRoom);
  const inviteAi = useRoomStore((s) => s.inviteAi);

  const navigate = useNavigate();
  const [hostedCode, setHostedCode] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  // 房主等待中：伙伴一到位就自动进入画布
  useEffect(() => {
    if (!hostedCode || !room || room.code !== hostedCode) return;
    if (room.players.length < 2) return;
    const timer = window.setTimeout(() => navigate(`/room/${hostedCode}`), 700);
    return () => window.clearTimeout(timer);
  }, [hostedCode, room, navigate]);

  const handleCreate = () => {
    const code = createRoom();
    if (!code) return;
    enterRoom(code);
    setHostedCode(code);
  };

  const handleJoin = (code: string) => {
    const ok = joinRoom(code);
    if (!ok) return false;
    enterRoom(code);
    navigate(`/room/${code}`);
    return true;
  };

  return (
    <div className="relative min-h-full">
      <DecorBackdrop />
      <ToastLayer toast={toast} />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <SloganMarquee />
        <BigTitle />

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <NamePlate
              name={profile?.name ?? ""}
              avatar={profile?.avatar ?? "🐤"}
              onName={rename}
              onAvatar={setAvatar}
            />
          </div>

          <div className="flex flex-col gap-5">
            {hostedCode ? (
              <HostPanel
                code={hostedCode}
                waitingCount={room?.players.length ?? 1}
                onEnter={() => navigate(`/room/${hostedCode}`)}
                onInviteAi={inviteAi}
              />
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticker relative overflow-hidden bg-grape/15 p-5 sm:p-6"
              >
                <Rocket className="absolute -right-4 -top-4 h-24 w-24 text-ink/5" strokeWidth={2} />
                <h2 className="font-doodle text-2xl tracking-wide">开一张新画布</h2>
                <p className="mt-1 text-sm text-ink/60">
                  生成 4 位房码，喊上你的搭子一起乱涂，30 秒开整
                </p>
                <button type="button" onClick={handleCreate} className="btn-lemon mt-5 w-full">
                  <Brush className="h-5 w-5" strokeWidth={3} />
                  开一张画布
                </button>
              </motion.section>
            )}

            <JoinPanel onJoin={handleJoin} />
          </div>
        </div>

        <HowToPlay />

        <footer className="pb-4 pt-2 text-center text-xs font-bold text-ink/40">
          同一个浏览器开两个标签页 = 两个玩家 · 无需注册 · 纯前端沙雕小游戏
        </footer>
      </div>
    </div>
  );
}

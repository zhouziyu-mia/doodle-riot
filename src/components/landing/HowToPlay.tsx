import { motion } from "framer-motion";

const STEPS = [
  {
    no: "1",
    emoji: "🎯",
    title: "抽到词条",
    desc: "系统只给画手看答案，猜手只能看到几个小圆点",
    bg: "bg-lemon-300",
    rotate: "-2deg",
  },
  {
    no: "2",
    emoji: "🖍️",
    title: "画手狂涂",
    desc: "拿马克笔在柠檬黄画布上放飞自我，笔画实时同步",
    bg: "bg-bolt/20",
    rotate: "1.5deg",
  },
  {
    no: "3",
    emoji: "🤯",
    title: "猜手狂猜",
    desc: "猜中即爆分，用时越短分越高，连击还有加成",
    bg: "bg-mint/25",
    rotate: "-1deg",
  },
];

/** 玩法三连图 */
export function HowToPlay() {
  return (
    <section className="mt-2">
      <h2 className="mb-4 text-center font-doodle text-2xl tracking-wide">怎么玩？（超简单）</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.article
            key={step.no}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
            style={{ rotate: step.rotate }}
            className={`sticker relative p-5 ${step.bg} transition-transform duration-200 hover:rotate-0 hover:-translate-y-1`}
          >
            <span className="absolute -left-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-tomato font-mono text-xl font-black text-white shadow-sticker-sm">
              {step.no}
            </span>
            <div className="text-4xl">{step.emoji}</div>
            <h3 className="mt-3 font-doodle text-xl tracking-wide">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{step.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

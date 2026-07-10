import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  Home, ListChecks, ShoppingBag, Users, User, RefreshCw, Zap, Send,
  MessageCircle, Flame, Link2, Gift, Share2, Copy, Check, X, ChevronRight,
  Sparkles, Trophy, Wallet, Coins, Loader2, AlertTriangle, Tv, HelpCircle,
  Ticket, Package, Wifi, Signal, BatteryFull, Dices, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight, ExternalLink, PlusCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */
const BRAND = "NOVA";

const initialTasks = [
  { id: "t-daily", type: "daily", tagIcon: Gift, tagLabel: "Ежедневный", title: "Ежедневный бонус", desc: "Заходите каждый день — награда растёт со стриком.", reward: 500 },
  { id: "t1", type: "auto", tagIcon: Send, tagLabel: "Подписка на ТГ", title: "Подпишитесь на Telegram-канал", desc: `Официальный канал ${BRAND} — анонсы эфиров и розыгрыши.`, reward: 350, status: "available", actionLabel: "Открыть канал" },
  { id: "t2", type: "auto", tagIcon: Tv, tagLabel: "Соцсеть", title: "Подпишитесь на канал стрима", desc: "Подписка на основной канал трансляций.", reward: 500, status: "available", actionLabel: "Открыть канал" },
  { id: "t3", type: "manual", tagIcon: MessageCircle, tagLabel: "Активность", title: "Напишите в чат во время стрима", desc: "Любое сообщение в чат в течение прямого эфира.", reward: 150, status: "available" },
  { id: "t4", type: "streak", tagIcon: Flame, tagLabel: "Стрик", title: "Смотрите стримы 3 дня подряд", desc: "Отмечается автоматически во время эфира.", reward: 300, progress: 2, goal: 3 },
  { id: "t5", type: "referral", tagIcon: Link2, tagLabel: "Рефералка", title: "Пригласите 3 друзей", desc: "Бонус начисляется при достижении цели.", reward: 1000, progress: 1, goal: 3 },
  { id: "t6", type: "manual", tagIcon: Share2, tagLabel: "Ручное", title: "Репост стрима друзьям", desc: "Поделитесь ссылкой на эфир и приложите скрин в бота.", reward: 250, status: "available", warning: "Важно: заявка проверяется модератором вручную." },
];

const shopItems = [
  { id: "s1", title: "Telegram Premium", subtitle: "3 месяца", price: 2500, stock: 50 },
  { id: "s2", title: "Промокод −10%", subtitle: "На донат платформы", price: 800, stock: 120 },
  { id: "s3", title: "Кейс «Сюрприз»", subtitle: "Случайный предмет", price: 1200, stock: 34 },
  { id: "s4", title: "Худи с лого", subtitle: "Мерч, S–XL", price: 8000, stock: 12 },
  { id: "s5", title: "Наушники", subtitle: "Розыгрыш техники", price: 15000, stock: 3 },
  { id: "s6", title: "Игровая мышь", subtitle: "Розыгрыш техники", price: 12000, stock: 0 },
];

const referralsList = [
  { id: "r1", name: "Дмитрий К.", date: "08.07.2026", status: "active" },
  { id: "r2", name: "Марина В.", date: "05.07.2026", status: "active" },
  { id: "r3", name: "Игорь П.", date: "02.07.2026", status: "pending" },
];

const initialTransactions = [
  { id: "tx1", type: "earn", label: "Ежедневный бонус", amount: 500, date: "Сегодня, 09:12" },
  { id: "tx2", type: "spend", label: "Покупка: Промокод −10%", amount: -800, date: "Вчера, 21:40" },
  { id: "tx3", type: "earn", label: "Реферал: Марина В.", amount: 200, date: "05.07.2026" },
  { id: "tx4", type: "earn", label: "Подписка на канал", amount: 350, date: "03.07.2026" },
];

const fmt = (n) => n.toLocaleString("ru-RU");

/* ------------------------------------------------------------------ */
/* Reusable primitives                                                 */
/* ------------------------------------------------------------------ */
function GlassCard({ children, glow, glowColor = "rgba(75,123,255,0.28)", strong, className = "", style, onClick }) {
  return (
    <div
      className={`glass-card ${strong ? "glass-card-strong" : ""} ${onClick ? "pressable" : ""} ${className}`}
      style={{ ...style, overflow: "visible" }}
      onClick={onClick}
    >
      {glow && <div className="glow" style={{ width: 140, height: 140, background: glowColor, top: -30, left: -20 }} />}
      {children}
    </div>
  );
}

function PillButton({ children, onClick, disabled, variant, full, sm, icon: Icon }) {
  return (
    <button
      className={`pill-btn ${variant === "success" ? "success" : ""} ${full ? "full" : ""} ${sm ? "sm" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function OutlineButton({ children, onClick, disabled, full }) {
  return (
    <button className={`outline-btn ${full ? "full" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ProgressBar({ value, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Tag({ icon: Icon, children }) {
  return (
    <span className="tag">
      <Icon size={12} />
      {children}
    </span>
  );
}

function BalanceChip({ balance }) {
  return (
    <div className="tag" style={{ background: "rgba(75,123,255,0.16)", color: "var(--text-primary)" }}>
      <Coins size={13} className="text-accent" />
      {fmt(balance)}
    </div>
  );
}

function ScreenHeader({ title, balance, onRefresh, spinning }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <BalanceChip balance={balance} />
        <button
          onClick={onRefresh}
          style={{ width: 34, height: 34, borderRadius: 999, background: "var(--glass-bg-strong)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", cursor: "pointer" }}
        >
          <RefreshCw size={15} className={spinning ? "spin-dial spinning" : ""} style={{ background: "none" }} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Home                                                                 */
/* ------------------------------------------------------------------ */
function HomeScreen({ balance, streak, isLive, onGoTasks, onSpin, spinning, onClaimDaily, dailyClaimed, platformConnected, onConnectPlatform }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar">ВД</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Вадим Д.</div>
            <div className="text-secondary" style={{ fontSize: 12.5 }}>Добро пожаловать 👋</div>
          </div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: "var(--glass-bg-strong)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", cursor: "pointer" }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <GlassCard glow glowColor="rgba(75,123,255,0.3)" style={{ marginBottom: 14 }}>
        <div className="text-secondary" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Баланс</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Coins size={26} className="text-accent" />
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>{fmt(balance)}</span>
          </div>
          <PillButton icon={Zap} onClick={onGoTasks}>Заработать</PillButton>
        </div>
        <div style={{ height: 1, background: "var(--glass-border)", margin: "14px 0 10px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: isLive ? "var(--accent-2)" : "var(--text-secondary)", boxShadow: isLive ? "0 0 8px var(--accent-2)" : "none" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }} className={isLive ? "text-success" : "text-secondary"}>
            {isLive ? "Стрим сейчас идёт" : "Сейчас офлайн"}
          </span>
        </div>
      </GlassCard>

      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="icon-badge"><Tv size={18} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Платформа стрима</div>
            <div className="text-secondary" style={{ fontSize: 12.5 }}>
              {platformConnected ? "Подключено" : "Подключите аккаунт для авто-проверок"}
            </div>
          </div>
          {platformConnected ? (
            <CheckCircle2 size={20} className="text-success" />
          ) : (
            <PillButton sm onClick={onConnectPlatform}>Подключить</PillButton>
          )}
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <GlassCard onClick={!spinning ? onSpin : undefined}>
          <div className={`spin-dial ${spinning ? "spinning" : ""}`} style={{ marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Dices size={20} />
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Испытать удачу</div>
          <div className="text-secondary" style={{ fontSize: 12 }}>Крутите раз в день</div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="streak-ring" style={{ background: `conic-gradient(var(--accent-2) ${(streak / 3) * 100}%, rgba(255,255,255,0.08) 0)` }}>
              <div className="streak-ring-inner">{streak}/3</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Стрик просмотра</div>
          <div className="text-secondary" style={{ fontSize: 12 }}>+300 за 3 дня</div>
        </GlassCard>
      </div>

      <GlassCard glow glowColor="rgba(52,211,153,0.22)" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="icon-badge"><Trophy size={18} className="text-success" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Конкурсы</div>
            <div className="text-secondary" style={{ fontSize: 12.5 }}>Розыгрыш наушников — 3 дня осталось</div>
          </div>
          <ChevronRight size={18} className="text-secondary" />
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <GlassCard onClick={dailyClaimed ? undefined : onClaimDaily}>
          <Gift size={20} className={dailyClaimed ? "text-secondary" : "text-accent"} style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Ежедневный бонус</div>
          <div className={dailyClaimed ? "text-success" : "text-secondary"} style={{ fontSize: 12, marginTop: 2 }}>
            {dailyClaimed ? "Получено ✓" : "+500 коинов"}
          </div>
        </GlassCard>
        <GlassCard>
          <HelpCircle size={20} className="text-secondary" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>FAQ / Поддержка</div>
          <div className="text-secondary" style={{ fontSize: 12, marginTop: 2 }}>Есть вопрос?</div>
        </GlassCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center", padding: "4px 4px 12px" }}>
        {[["12 480", "Пользователей"], ["4.2М", "Заработано"], ["8 150", "Наград выдано"]].map(([n, l]) => (
          <div key={l}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{n}</div>
            <div className="text-secondary" style={{ fontSize: 11 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tasks                                                                */
/* ------------------------------------------------------------------ */
function TaskCard({ task, dailyClaimed, onComplete, onClaimDaily, onGoReferrals }) {
  const Icon = task.tagIcon;

  const rightAction = () => {
    if (task.type === "daily") {
      return dailyClaimed
        ? <span className="tag" style={{ background: "rgba(52,211,153,0.16)" }}><Check size={12} className="text-success" />Готово</span>
        : <PillButton sm onClick={onClaimDaily}>Забрать</PillButton>;
    }
    if (task.type === "streak") return null;
    if (task.type === "referral") return <OutlineButton onClick={onGoReferrals}>Пригласить</OutlineButton>;
    if (task.status === "checking") return <PillButton sm disabled icon={Loader2}>Проверка…</PillButton>;
    if (task.status === "pending") return <span className="tag text-warning" style={{ background: "rgba(251,191,36,0.14)" }}>На проверке</span>;
    if (task.status === "completed") return <span className="tag" style={{ background: "rgba(52,211,153,0.16)" }}><Check size={12} className="text-success" />Выполнено</span>;
    if (task.type === "auto") {
      return (
        <div style={{ display: "flex", gap: 6 }}>
          <OutlineButton onClick={() => {}}>Перейти</OutlineButton>
          <PillButton sm onClick={() => onComplete(task.id)}>Проверить</PillButton>
        </div>
      );
    }
    return <PillButton sm onClick={() => onComplete(task.id)}>Выполнить</PillButton>;
  };

  return (
    <GlassCard style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <Tag icon={Icon}>{task.tagLabel}</Tag>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 800, fontSize: 14 }}>
          <Coins size={14} className="text-accent" />+{fmt(task.reward)}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{task.title}</div>
      <div className="text-secondary" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 12 }}>{task.desc}</div>

      {(task.type === "streak" || task.type === "referral") && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }} className="text-secondary">
            <span>Прогресс</span><span>{task.progress}/{task.goal}</span>
          </div>
          <ProgressBar value={task.progress} max={task.goal} />
        </div>
      )}

      {task.warning && (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 11.5, marginBottom: 12 }} className="text-warning">
          <AlertTriangle size={13} style={{ marginTop: 1, flexShrink: 0 }} />
          <span>{task.warning}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>{rightAction()}</div>
    </GlassCard>
  );
}

function TasksScreen({ tasks, balance, dailyClaimed, onComplete, onClaimDaily, onGoReferrals, onRefresh, refreshing }) {
  return (
    <div>
      <ScreenHeader title="Задания" balance={balance} onRefresh={onRefresh} spinning={refreshing} />
      <div className="text-secondary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        Доступные
      </div>
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} dailyClaimed={dailyClaimed} onComplete={onComplete} onClaimDaily={onClaimDaily} onGoReferrals={onGoReferrals} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shop                                                                 */
/* ------------------------------------------------------------------ */
function ShopScreen({ items, balance, onBuy, onRefresh, refreshing }) {
  return (
    <div>
      <ScreenHeader title="Магазин" balance={balance} onRefresh={onRefresh} spinning={refreshing} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it) => (
          <GlassCard key={it.id} style={{ padding: 14 }}>
            <div style={{ position: "relative", height: 78, borderRadius: 16, background: "linear-gradient(135deg, rgba(75,123,255,0.18), rgba(124,92,255,0.12))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Package size={26} className="text-accent" />
              <span className="tag" style={{ position: "absolute", top: 6, right: 6, fontSize: 10, padding: "3px 7px", background: "rgba(0,0,0,0.5)" }}>
                {it.stock > 0 ? `${it.stock} шт.` : "нет"}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>{it.title}</div>
            <div className="text-secondary" style={{ fontSize: 11.5, marginBottom: 10 }}>{it.subtitle}</div>
            <PillButton full sm disabled={it.stock === 0} icon={Coins} onClick={() => onBuy(it)}>
              {it.stock === 0 ? "Раскуплено" : fmt(it.price)}
            </PillButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function BuyModal({ item, balance, onConfirm, onCancel }) {
  if (!item) return null;
  const canAfford = balance >= item.price;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <GlassCard strong glow glowColor="rgba(75,123,255,0.3)">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 44, height: 4, borderRadius: 999, background: "var(--glass-border)" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4, textAlign: "center" }}>{item.title}</div>
          <div className="text-secondary" style={{ fontSize: 13, textAlign: "center", marginBottom: 16 }}>{item.subtitle}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            <Coins size={20} className="text-accent" />{fmt(item.price)}
          </div>
          {!canAfford && (
            <div className="text-danger" style={{ fontSize: 12.5, textAlign: "center", marginBottom: 12 }}>
              Недостаточно коинов — не хватает {fmt(item.price - balance)}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <OutlineButton full onClick={onCancel}>Отмена</OutlineButton>
            <PillButton full disabled={!canAfford} onClick={() => onConfirm(item)}>Подтвердить</PillButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Referrals                                                           */
/* ------------------------------------------------------------------ */
function ReferralsScreen({ referrals, invited, earned, copied, onCopy }) {
  const active = referrals.filter((r) => r.status === "active").length;
  return (
    <div>
      <div style={{ padding: "10px 2px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Рефералы</h1>
      </div>

      <GlassCard glow glowColor="rgba(124,92,255,0.28)" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Реферальная ссылка</div>
        <div className="text-secondary" style={{ fontSize: 12.5, marginBottom: 12 }}>
          +200 коинов за друга и 5% от его наград
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: "10px 12px", marginBottom: 12 }}>
          <span style={{ fontSize: 12.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="text-secondary">
            t.me/{BRAND.toLowerCase()}_rewards_bot?start=ref_482910
          </span>
          <button onClick={onCopy} style={{ background: "none", border: "none", color: copied ? "var(--accent-2)" : "var(--text-primary)", cursor: "pointer", display: "flex" }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <PillButton full icon={Share2} onClick={onCopy}>Поделиться в Telegram</PillButton>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[[invited, "Приглашено"], [active, "Активных"], [fmt(earned), "Заработано"]].map(([n, l]) => (
          <GlassCard key={l} style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{n}</div>
            <div className="text-secondary" style={{ fontSize: 10.5 }}>{l}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>Бонус за 3 друзей</span>
          <span className="text-secondary">{active}/3</span>
        </div>
        <ProgressBar value={active} max={3} />
      </GlassCard>

      <div className="text-secondary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        Ваши рефералы
      </div>
      {referrals.map((r) => (
        <GlassCard key={r.id} style={{ marginBottom: 10, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
              {r.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
              <div className="text-secondary" style={{ fontSize: 11.5 }}>{r.date}</div>
            </div>
            <span className={`tag ${r.status === "active" ? "text-success" : "text-warning"}`} style={{ background: r.status === "active" ? "rgba(52,211,153,0.14)" : "rgba(251,191,36,0.14)" }}>
              {r.status === "active" ? "Активен" : "Ожидание"}
            </span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                              */
/* ------------------------------------------------------------------ */
function ProfileScreen({ balance, invited, earned, spent, transactions, promo, setPromo, onPromoSubmit, promoMsg, kickConnected, tgConnected, onToggleKick }) {
  return (
    <div>
      <div style={{ padding: "10px 2px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Профиль</h1>
      </div>

      <GlassCard glow glowColor="rgba(75,123,255,0.28)" style={{ marginBottom: 14, textAlign: "center" }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 20, margin: "0 auto 10px" }}>ВД</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Вадим Д.</div>
        <div className="text-secondary" style={{ fontSize: 12.5 }}>@vadandy · ID 482910</div>
      </GlassCard>

      <div className="text-secondary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        Подключённые аккаунты
      </div>
      <GlassCard style={{ marginBottom: 14, padding: 6 }}>
        {[
          { icon: Send, label: "Telegram-канал", connected: tgConnected, toggle: null },
          { icon: Tv, label: "Платформа стрима", connected: kickConnected, toggle: onToggleKick },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: i === 0 ? "1px solid var(--glass-border)" : "none" }}>
            <div className="icon-badge"><row.icon size={17} /></div>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{row.label}</div>
            {row.connected ? (
              <span className="tag" style={{ background: "rgba(52,211,153,0.14)" }}><Check size={11} className="text-success" />Подключено</span>
            ) : (
              <OutlineButton onClick={row.toggle}>Подключить</OutlineButton>
            )}
          </div>
        ))}
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          [fmt(balance), "Баланс", Wallet],
          [invited, "Рефералов", Users],
          [fmt(earned), "Заработано", ArrowUpRight],
          [fmt(spent), "Потрачено", ArrowDownRight],
        ].map(([n, l, Ic]) => (
          <GlassCard key={l} style={{ padding: 14 }}>
            <Ic size={16} className="text-secondary" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 800, fontSize: 17 }}>{n}</div>
            <div className="text-secondary" style={{ fontSize: 11.5 }}>{l}</div>
          </GlassCard>
        ))}
      </div>

      <div className="text-secondary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        Кейсы
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, overflowX: "auto" }}>
        {[1, 2].map((n) => (
          <GlassCard key={n} style={{ minWidth: 88, textAlign: "center", padding: 12 }}>
            <Ticket size={22} className="text-accent" style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Кейс #{n}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Промокод</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Введите код"
            style={{ flex: 1, background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-border)", borderRadius: 14, padding: "10px 12px", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
          />
          <PillButton sm onClick={onPromoSubmit}>Ввести</PillButton>
        </div>
        {promoMsg && (
          <div style={{ fontSize: 12, marginTop: 8 }} className={promoMsg.ok ? "text-success" : "text-danger"}>
            {promoMsg.text}
          </div>
        )}
      </GlassCard>

      <div className="text-secondary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        История транзакций
      </div>
      {transactions.length === 0 ? (
        <GlassCard style={{ textAlign: "center", padding: 24 }}>
          <div className="text-secondary" style={{ fontSize: 13 }}>История пуста</div>
        </GlassCard>
      ) : (
        transactions.map((tx) => (
          <GlassCard key={tx.id} style={{ marginBottom: 10, padding: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="icon-badge" style={{ background: tx.type === "earn" ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)" }}>
                {tx.type === "earn" ? <ArrowUpRight size={16} className="text-success" /> : <ArrowDownRight size={16} className="text-danger" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.label}</div>
                <div className="text-secondary" style={{ fontSize: 11 }}>{tx.date}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13.5 }} className={tx.type === "earn" ? "text-success" :

import type { MessageItem } from "../actions";

export function MessageBubble({
  message,
  isOwn,
}: {
  message: MessageItem;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const initials = message.senderName
    ? message.senderName.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div
      className={`flex items-end gap-2 mb-3 animate-fade-up ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
      style={{ animationDuration: "0.3s" }}
    >
      {/* Avatar (only for received) */}
      {!isOwn && (
        <div className="shrink-0">
          {message.senderImage ? (
            <img
              src={message.senderImage}
              alt={message.senderName ?? "User"}
              className="h-7 w-7 rounded-lg object-cover border border-border/60"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-[10px] font-bold text-white">
              {initials}
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwn
            ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-md"
            : "bg-card border border-border/60 text-foreground rounded-bl-md"
        }`}
      >
        {message.attachmentUrl && (
          <div className="mb-2 overflow-hidden rounded-xl bg-muted/50 max-w-[240px] md:max-w-[320px]">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={message.attachmentUrl} alt="attachment" className="w-full object-cover" />
          </div>
        )}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <div
          className={`flex items-center gap-1.5 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? "text-white/60" : "text-muted-foreground"
            }`}
          >
            {time}
          </span>
          {isOwn && (
            <span className="text-[10px] text-white/50">
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

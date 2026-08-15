import { prisma } from "@/lib/db";

export default async function MessagesPage() {
  const messages = await prisma.lineMessage.findMany({
    orderBy: { timestamp: "desc" },
    take: 200,
    select: {
      id: true,
      displayName: true,
      timestamp: true,
      messageType: true,
      text: true,
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">LINE Group Messages</h1>
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500">
          No messages received yet. Once your LINE Official Account is set up
          and added to your group, messages will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border border-gray-200 rounded-md px-4 py-3"
            >
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{msg.displayName ?? "Unknown sender"}</span>
                <span>{msg.timestamp.toLocaleString()}</span>
              </div>
              {msg.messageType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/admin/messages/${msg.id}/image`}
                  alt="LINE attachment"
                  className="max-w-xs max-h-64 rounded-md border border-gray-200"
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

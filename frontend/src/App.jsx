import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function App() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Load saved chats
  useEffect(() => {
    const savedChats = localStorage.getItem("aiChats");

    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);

        setChats(parsedChats);

        if (parsedChats.length > 0) {
          setActiveChatId(parsedChats[0].id);
          setMessages(parsedChats[0].messages || []);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    }
  }, []);

  // Save chats
  useEffect(() => {
    localStorage.setItem("aiChats", JSON.stringify(chats));
  }, [chats]);

  // New chat
  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setMessage("");
    setEditingChatId(null);
  };

  // Open chat
  const openChat = (chat) => {
    setActiveChatId(chat.id);
    setMessages(chat.messages || []);
    setMessage("");
  };

  // Delete chat
  const deleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);

    setChats(updatedChats);

    if (activeChatId === id) {
      if (updatedChats.length > 0) {
        setActiveChatId(updatedChats[0].id);
        setMessages(updatedChats[0].messages || []);
      } else {
        setActiveChatId(null);
        setMessages([]);
      }

      setMessage("");
    }
  };

  // Rename chat
  const startRename = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveRename = (id) => {
    if (!editTitle.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title: editTitle.trim(),
            }
          : chat
      )
    );

    setEditingChatId(null);
    setEditTitle("");
  };

  // Suggested prompt
  const selectPrompt = (prompt) => {
    setMessage(prompt);
  };
const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    setMessage((prev) =>
      prev ? prev + " " + transcript : transcript
    );
  };

  recognition.onerror = (event) => {
    console.error("Voice error:", event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};
  // Copy AI message
  const copyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      const finalMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content:
            data.reply || "Sorry, mujhe response nahi mila.",
        },
      ];

      setMessages(finalMessages);

      // Existing chat
      if (activeChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: finalMessages,
                }
              : chat
          )
        );
      }

      // New chat
      else {
        const newId = Date.now();

        const firstUserMessage =
          finalMessages.find(
            (msg) => msg.role === "user"
          )?.content || "New Chat";

        const newChatData = {
          id: newId,
          title:
            firstUserMessage.length > 30
              ? firstUserMessage.substring(0, 30) + "..."
              : firstUserMessage,
          messages: finalMessages,
        };

        setChats((prev) => [newChatData, ...prev]);
        setActiveChatId(newId);
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Server se connection nahi ho raha. Backend check karein.",
        },
      ];

      setMessages(errorMessages);

      // Save error conversation too
      if (activeChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages: errorMessages,
                }
              : chat
          )
        );
      } else {
        const newId = Date.now();

        setChats((prev) => [
          {
            id: newId,
            title:
              userMessage.length > 30
                ? userMessage.substring(0, 30) + "..."
                : userMessage,
            messages: errorMessages,
          },
          ...prev,
        ]);

        setActiveChatId(newId);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enter = Send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Search chats
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#212121] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#171717] flex-col p-3">

        <button
          onClick={newChat}
          className="w-full rounded-lg border border-gray-700 px-4 py-3 text-left hover:bg-[#2a2a2a] transition"
        >
          + New Chat
        </button>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Search chats..."
            className="w-full bg-[#252525] border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 placeholder-gray-500"
          />
        </div>

        <div className="mt-6 px-3 text-sm text-gray-500">
          Chat History
        </div>

        {/* Chat History */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2">

          {filteredChats.length === 0 ? (
            <p className="px-3 text-xs text-gray-600">
              No chats found
            </p>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group rounded-lg px-2 py-2 transition ${
                  activeChatId === chat.id
                    ? "bg-[#303030]"
                    : "hover:bg-[#252525]"
                }`}
              >

                {editingChatId === chat.id ? (
                  <div className="flex gap-1">

                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveRename(chat.id);
                        }

                        if (e.key === "Escape") {
                          setEditingChatId(null);
                          setEditTitle("");
                        }
                      }}
                      className="flex-1 min-w-0 bg-[#171717] border border-gray-600 rounded px-2 py-1 text-sm outline-none"
                    />

                    <button
                      onClick={() => saveRename(chat.id)}
                      className="text-green-400 hover:text-green-300 px-1"
                    >
                      ✓
                    </button>

                  </div>
                ) : (
                  <div className="flex items-center gap-1">

                    <button
                      onClick={() => openChat(chat)}
                      className="flex-1 min-w-0 text-left text-sm truncate px-1 py-1"
                    >
                      💬 {chat.title}
                    </button>

                    <button
                      onClick={() => startRename(chat)}
                      className="hidden group-hover:block text-gray-500 hover:text-white px-1"
                      title="Rename"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="hidden group-hover:block text-gray-500 hover:text-red-400 px-1"
                      title="Delete"
                    >
                      ×
                    </button>

                  </div>
                )}

              </div>
            ))
          )}

        </div>

        <div className="text-xs text-gray-500 px-3 pt-4">
          Powered by Groq
        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="h-16 border-b border-gray-700 flex items-center justify-between px-5">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              🤖
            </div>

            <div>
              <h1 className="font-semibold">
                AI Assistant
              </h1>

              <p className="text-xs text-gray-500">
                Your intelligent assistant
              </p>
            </div>

          </div>

          <button
            onClick={newChat}
            className="md:hidden text-gray-400 hover:text-white"
          >
            + New
          </button>

        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto">

          {messages.length === 0 ? (

            <div className="h-full flex items-center justify-center px-5">

              <div className="text-center max-w-2xl">

                <div className="text-5xl mb-5">
                  ✨
                </div>

                <h2 className="text-3xl md:text-4xl font-semibold mb-3">
                  How can I help you today?
                </h2>

                <p className="text-gray-400">
                  Ask me anything. I can help with coding,
                  study, writing, ideas and more.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">

                  <button
                    onClick={() =>
                      selectPrompt("Help me write code")
                    }
                    className="border border-gray-700 rounded-xl p-4 text-left hover:bg-[#2a2a2a] hover:border-gray-500 transition"
                  >
                    <span className="text-2xl">💻</span>

                    <p className="mt-2 font-medium">
                      Coding
                    </p>

                    <p className="text-sm text-gray-500">
                      Help me write code
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      selectPrompt("Explain a topic to me")
                    }
                    className="border border-gray-700 rounded-xl p-4 text-left hover:bg-[#2a2a2a] hover:border-gray-500 transition"
                  >
                    <span className="text-2xl">📚</span>

                    <p className="mt-2 font-medium">
                      Study
                    </p>

                    <p className="text-sm text-gray-500">
                      Explain a topic
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      selectPrompt(
                        "Give me some creative ideas"
                      )
                    }
                    className="border border-gray-700 rounded-xl p-4 text-left hover:bg-[#2a2a2a] hover:border-gray-500 transition"
                  >
                    <span className="text-2xl">💡</span>

                    <p className="mt-2 font-medium">
                      Ideas
                    </p>

                    <p className="text-sm text-gray-500">
                      Give me creative ideas
                    </p>
                  </button>

                </div>

              </div>

            </div>

          ) : (

            <div className="max-w-3xl mx-auto px-4 py-8">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`flex gap-4 mb-7 ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                      🤖
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 leading-7 whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#303030]"
                        : "bg-[#252525]"
                    }`}
                  >

                    <ReactMarkdown
                      components={{
                        code({
                          inline,
                          className,
                          children,
                          ...props
                        }) {
                          const match =
                            /language-(\w+)/.exec(
                              className || ""
                            );

                          return !inline && match ? (
                            <div className="relative my-4 overflow-hidden rounded-xl">

                              <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2 text-xs text-gray-400">
                                <span>
                                  {match[1]}
                                </span>

                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      String(children)
                                    )
                                  }
                                  className="hover:text-white"
                                >
                                  📋 Copy Code
                                </button>
                              </div>

                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="m-0!"
                                {...props}
                              >
                                {String(children).replace(
                                  /\n$/,
                                  ""
                                )}
                              </SyntaxHighlighter>

                            </div>
                          ) : (
                            <code
                              className="bg-[#1e1e1e] px-1.5 py-0.5 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {msg.role === "assistant" && (
                      <button
                        onClick={() =>
                          copyMessage(
                            msg.content,
                            index
                          )
                        }
                        className="mt-2 text-xs text-gray-500 hover:text-white transition"
                      >
                        {copiedIndex === index
                          ? "✓ Copied!"
                          : "📋 Copy"}
                      </button>
                    )}

                  </div>

                </div>

              ))}

              {/* LOADING */}
              {loading && (
                <div className="flex gap-4 items-center">

                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    🤖
                  </div>

                  <div className="bg-[#252525] rounded-2xl px-4 py-3 flex gap-1">

                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>

                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></span>

                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></span>

                  </div>

                </div>
              )}

            </div>

          )}

        </div>

        {/* INPUT */}
        <div className="w-full px-4 pb-5">

          <div className="max-w-3xl mx-auto">

            <div className="flex items-end gap-2 bg-[#2f2f2f] border border-gray-600 rounded-2xl px-4 py-3 shadow-lg">

              <textarea
                rows="1"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                className="flex-1 resize-none bg-transparent outline-none text-white placeholder-gray-500 max-h-32"
              />

              <button
              
  onClick={startVoiceInput}
  className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
    isListening
      ? "bg-red-500 text-white"
      : "bg-[#404040] text-white hover:bg-[#505050]"
  }`}
  title={isListening ? "Listening..." : "Voice input"}
>
  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
</button>
                <button
                onClick={sendMessage}
                disabled={
                  loading || !message.trim()
                }
                className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ↑
              </button>

            </div>

            <p className="text-center text-xs text-gray-600 mt-2">
              AI can make mistakes. Check important information.
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}

export default App;
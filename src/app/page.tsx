'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(true); // ✅ control input visibility
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, { role: 'assistant' as const, content: data.reply }]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant' as const, content: '⚠️ Error getting response.' },
      ]);
    }

    setLoading(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Copied to clipboard!');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cellStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #ddd',
    padding: '16px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    marginBottom: '12px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '10px 20px', borderBottom: '1px solid #ddd', backgroundColor: '#fafafa' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Jupyter Notebook</h1>
        <label style={{ fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={showInput}
            onChange={() => setShowInput(!showInput)}
            style={{ marginRight: '8px' }}
          />
          Show input cell
        </label>
      </header>

      <main style={{ flex: 1, padding: '20px', background: '#f6f6f6', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={cellStyle}>
            {msg.role === 'user' ? (
              <div>
                <span style={{ color: '#008000', marginRight: '8px' }}>{`In [${Math.ceil((idx + 1) / 2)}]:`}</span>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <div>
                <span style={{ color: '#0000CD', marginRight: '8px' }}>{`Out [${Math.ceil(idx / 2)}]:`}</span>
                <ReactMarkdown
                  components={{
                    code: ({ inline, children }: any) => {
                      const code = String(children).trim();
                      return inline ? (
                        <code style={{ backgroundColor: '#eee', padding: '2px 4px', borderRadius: '4px' }}>
                          {code}
                        </code>
                      ) : (
                        <div style={{ position: 'relative', marginTop: '8px' }}>
                          <button
                            onClick={() => handleCopy(code)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              fontSize: '12px',
                              background: '#ccc',
                              border: 'none',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            
                          </button>
                          <pre
                            style={{
                              background: '#f7f7f7', // ✅ Jupyter-like light background
                              color: '#000',
                              padding: '12px',
                              borderRadius: '4px',
                              overflowX: 'auto',
                              border: '1px solid #ddd',
                            }}
                          >
                            <code>{code}</code>
                          </pre>
                        </div>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={cellStyle}>
            <span style={{ color: '#0000CD', marginRight: '8px' }}>{`Out [${Math.ceil(messages.length / 2)}]:`}</span>
            <span style={{ fontStyle: 'italic', color: 'gray' }}>Assistant is typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {showInput && (
        <footer style={{ padding: '16px', borderTop: '1px solid #ddd', background: '#fafafa' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              placeholder="Type your command..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{
                flex: 1,
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '12px 16px',
                backgroundColor: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Run
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

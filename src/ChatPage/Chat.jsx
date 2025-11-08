// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import { FiMic, FiSend, FiX } from "react-icons/fi";
import { IoChevronBack } from "react-icons/io5";
import Navbar from "../nav/Navbar";
import robotAvatar from "../assets/avatar/bot.png";
import userAvatar from "../assets/avatar/avatar_farm.png";
import { Link } from "react-router-dom";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "🌾 Hi there! I’m FreshAir — your agriculture assistant. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => `sess_${Date.now()}`);
  const [lang, setLang] = useState("en");

  const [history, setHistory] = useState([]); // list of sessions
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeVoiceOverlay();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // fetch chat sessions for history panel on mount
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    fetch(`${BASE_URL}/api/chats`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setHistory(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // load history for this session if exists
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    fetch(`${BASE_URL}/api/chat/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setMessages(d);
        }
      })
      .catch(() => {});
  }, [sessionId]);

  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => console.warn("Speech recognition error:", e);
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (text && text.trim()) {
        setInput(text);
        sendMessage(text, true);
      }
    };
    return rec;
  }

  async function callBackendSend(text) {
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    try {
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, sessionId, lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("callBackendSend error:", err);
      return { error: "network", detail: String(err) };
    }
  }

  async function sendMessage(messageText, fromVoice = false) {
    const trimmed = messageText?.trim();
    if (!trimmed) return;
    const userMessage = { id: Date.now(), from: "user", text: trimmed };
    setMessages((m) => [...m, userMessage]);
    setInput("");

    const data = await callBackendSend(trimmed);
    if (data?.reply) {
      const botMsg = { id: Date.now() + 1, from: "bot", text: data.reply };
      setMessages((m) => [...m, botMsg]);
      speakText(data.reply, lang);
    } else {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bot", text: "⚠️ Server error. Check console for details." },
      ]);
    }
    if (data?.sessionId) setSessionId(data.sessionId);

    // update history list quickly (optimistic)
    if (!history.find((h) => h.sessionId === (data?.sessionId || sessionId))) {
      setHistory((h) => [{ sessionId: data?.sessionId || sessionId, title: trimmed, updatedAt: Date.now() }, ...h]);
    }
  }

  function handleSend() {
    if (input.trim()) sendMessage(input);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function openVoiceOverlay() {
    setVoiceOpen(true);
    if (!recognitionRef.current) recognitionRef.current = createRecognition();
  }

  function closeVoiceOverlay() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
      recognitionRef.current = null;
    }
    setListening(false);
    setVoiceOpen(false);
  }

  function toggleListening() {
    if (!recognitionRef.current) recognitionRef.current = createRecognition();
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    try {
      if (listening) recognitionRef.current.stop();
      else {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn("toggleListening error:", err);
    }
  }

  function speakText(text, language = "en") {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((vv) => vv.lang?.startsWith(language));
    if (v) utter.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  async function loadSession(sessionIdToLoad) {
    setSessionId(sessionIdToLoad);
    // messages will be loaded by effect that watches sessionId
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Desktop layout uses a left area + center chat + right history */}
        <aside className={styles.leftSidebar}>
          {/* minimal left sidebar — keep small avatar + nav (you can replace with your real Nav) */}
          <div className={styles.brand}>
            <img src={robotAvatar} alt="FreshAir" className={styles.brandAvatar} />
            <div className={styles.brandText}>FreshAir</div>
          </div>
          <nav className={styles.leftNav}>
            <Link to="/home" className={styles.navItem}>Home</Link>
            <Link to="/chat" className={`${styles.navItem} ${styles.active}`}>FreshAir Bot</Link>
            <Link to="/analysis" className={styles.navItem}>Analysis</Link>
            <Link to="/predetect" className={styles.navItem}>Pre-detection</Link>
            <Link to="/reports" className={styles.navItem}>Farm Reports</Link>
            <Link to="/community" className={styles.navItem}>Community</Link>
            <Link to="/schemes" className={styles.navItem}>Schemes</Link>
          </nav>
          <div className={styles.profileMini}>
            <img src={userAvatar} alt="you" className={styles.brandAvatar} />
            <div className={styles.profileName}>John Doe</div>
          </div>
        </aside>

        <section className={styles.chatArea}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <Link to="/home">
                <button className={styles.backBtn} aria-label="back">
                  <IoChevronBack size={20} />
                </button>
              </Link>
              <h1 className={styles.title}>FreshAir Bot</h1>
            </div>
            <div className={styles.langSelect}>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="ta">தமிழ்</option>
                <option value="ml">മലയാളം</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </header>

          <main className={styles.chatCard} aria-live="polite">
            <div className={styles.messages} ref={scrollRef}>
              {messages.map((m) => (
                <div key={m.id} className={`${styles.messageRow} ${m.from === "user" ? styles.rowRight : styles.rowLeft}`}>
                  {m.from === "bot" && <img src={robotAvatar} alt="bot" className={styles.smallAvatar} />}
                  <div className={`${styles.bubble} ${m.from === "user" ? styles.bubbleUser : styles.bubbleBot}`}>
                    <div className={styles.bubbleText}>{m.text}</div>
                  </div>
                  {m.from === "user" && <img src={userAvatar} alt="you" className={styles.smallAvatar} />}
                </div>
              ))}
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputWrap}>
                <input
                  ref={inputRef}
                  className={styles.input}
                  placeholder="Ask about crops, soil, or fertilizers..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button className={styles.micBtn} onClick={openVoiceOverlay} title="Voice input">
                  <FiMic />
                </button>
              </div>

              <button className={styles.sendBtn} onClick={handleSend}>
                <FiSend />
              </button>
            </div>

            {voiceOpen && (
              <div className={styles.voiceOverlay}>
                <div className={styles.voiceInner}>
                  <div className={`${styles.voiceSphere} ${listening ? styles.listening : ""}`}>
                    <div className={`${styles.cloudLayer} ${styles.cloudA}`} />
                    <div className={`${styles.cloudLayer} ${styles.cloudB}`} />
                    <div className={`${styles.cloudLayer} ${styles.cloudC}`} />
                  </div>
                  <div className={styles.voiceText}>{listening ? "Listening..." : "Voice Chat"}</div>
                  <div className={styles.voiceControls}>
                    <button className={styles.voiceBtn} onClick={toggleListening}>
                      <FiMic size={20} />
                    </button>
                    <button className={styles.voiceBtnOutline} onClick={closeVoiceOverlay}>
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
          <div className={styles.bottomPlaceholder}>
            <Navbar />
          </div>
        </section>

        <aside className={styles.historyPanel}>
          <div className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <input placeholder="Search for chats" className={styles.historySearch} />
            </div>
            <div className={styles.historyList}>
              {history.length === 0 && <div className={styles.emptyHint}>No chats yet</div>}
              {history.map((h) => (
                <button key={h.sessionId} className={styles.historyItem} onClick={() => loadSession(h.sessionId)}>
                  <div className={styles.historyTitle}>{h.title || "New chat"}</div>
                  <div className={styles.historyMeta}>{new Date(h.updatedAt || Date.now()).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

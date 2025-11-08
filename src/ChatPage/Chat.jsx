// src/components/Chat.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import styles from "./Chat.module.css";
import { FiMic, FiSend, FiX, FiChevronDown, FiSearch } from "react-icons/fi";
import { IoChevronBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import robotAvatar from "../assets/avatar/bot.png";
import userAvatar from "../assets/avatar/avatar_farm.png";
import Navbar from "../nav/Navbar";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "How can I help today?" },
    { id: 2, from: "user", text: "There’s some black spots in my paddy leaves" },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => `sess_${Date.now()}`);
  const [lang, setLang] = useState("en");

  // history dropdown
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // autoscroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // fetch chat sessions for header dropdown
  useEffect(() => {
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    fetch(`${BASE_URL}/api/chats`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setHistory(d);
      })
      .catch(() => {});
  }, []);

  // load a session’s messages whenever sessionId changes
  useEffect(() => {
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
    fetch(`${BASE_URL}/api/chat/${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length) setMessages(d);
      })
      .catch(() => {});
  }, [sessionId]);

  // ===== Speech =====
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

  // ===== Chat send =====
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

    // optimistic history add
    const thisId = data?.sessionId || sessionId;
    if (!history.find((h) => h.sessionId === thisId)) {
      setHistory((h) => [
        { sessionId: thisId, title: trimmed, updatedAt: Date.now() },
        ...h,
      ]);
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

  // ===== Voice overlay =====
  function openVoiceOverlay() {
    setVoiceOpen(true);
    if (!recognitionRef.current) recognitionRef.current = createRecognition();
  }
  function closeVoiceOverlay() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
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

  // ===== Header actions =====
  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return history;
    return history.filter((h) => (h.title || "New chat").toLowerCase().includes(q));
  }, [history, historySearch]);

  function newChat() {
    const newId = `sess_${Date.now()}`;
    setSessionId(newId);
    setMessages([{ id: Date.now(), from: "bot", text: "How can I help today?" }]);
  }

  function loadSession(id) {
    setSessionId(id);
    setHistoryOpen(false);
  }

  // close dropdown on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setHistoryOpen(false);
    }
    if (historyOpen) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [historyOpen]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Link to="/home" className={styles.backBtn} aria-label="Back">
              <IoChevronBack size={18} />
            </Link>
            <h1 className={styles.title}>FreshAir Bot</h1>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.newChatBtn} onClick={newChat}>New Chat</button>

            <div className={styles.chatsWrap} ref={dropdownRef}>
              <button
                className={styles.chatsBtn}
                onClick={() => setHistoryOpen((v) => !v)}
                aria-expanded={historyOpen}
              >
                Chats <FiChevronDown />
              </button>

              {historyOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.searchRow}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      placeholder="Search for chats"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>
                  <div className={styles.historyList}>
                    {filteredHistory.length === 0 && (
                      <div className={styles.emptyHint}>No chats</div>
                    )}
                    {filteredHistory.map((h) => (
                      <button
                        key={h.sessionId}
                        className={styles.historyItem}
                        onClick={() => loadSession(h.sessionId)}
                      >
                        <span className={styles.historyTitle}>
                          {h.title || "New chat"}
                        </span>
                        <span className={styles.historyMeta}>
                          {new Date(h.updatedAt || Date.now()).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <select
              className={styles.langSelect}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="ml">മലയാളം</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        </header>

        {/* Chat card */}
        <main className={styles.chatCard} aria-live="polite">
          <div className={styles.messages} ref={scrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.messageRow} ${m.from === "user" ? styles.rowRight : styles.rowLeft}`}
              >
                {m.from === "bot" && (
                  <img src={robotAvatar} alt="bot" className={styles.smallAvatar} />
                )}
                <div
                  className={`${styles.bubble} ${m.from === "user" ? styles.bubbleUser : styles.bubbleBot}`}
                >
                  <div className={styles.bubbleText}>{m.text}</div>
                </div>
                {m.from === "user" && (
                  <img src={userAvatar} alt="you" className={styles.smallAvatar} />
                )}
              </div>
            ))}
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputWrap}>
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Enter your query...."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button className={styles.micBtn} onClick={openVoiceOverlay} title="Voice input">
                <FiMic />
              </button>
            </div>

            <button className={styles.sendBtn} onClick={handleSend} aria-label="Send">
              <FiSend />
            </button>
          </div>

          {voiceOpen && (
            <div className={styles.voiceOverlay} role="dialog" aria-modal="true">
              <div className={styles.voiceInner}>
                <div className={`${styles.voiceSphere} ${listening ? styles.listening : ""}`}>
                  <div className={`${styles.cloudLayer} ${styles.cloudA}`} />
                  <div className={`${styles.cloudLayer} ${styles.cloudB}`} />
                  <div className={`${styles.cloudLayer} ${styles.cloudC}`} />
                </div>
                <div className={styles.voiceText}>
                  {listening ? "Listening..." : "Voice Chat"}
                </div>
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

        {/* bottom tab bar (mobile) */}
        <div className={styles.bottomPlaceholder}>
          <Navbar />
        </div>
      </div>
    </div>
  );
}

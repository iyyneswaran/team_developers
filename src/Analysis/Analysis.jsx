// src/pages/Analysis.jsx
import React, { useRef, useState } from "react";
import styles from "./Analysis.module.css";
import { BsStars } from "react-icons/bs";
import { FiUploadCloud, FiInfo, FiX, FiCheck, FiLoader } from "react-icons/fi";
import Navbar from "../nav/Navbar";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Analysis() {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const MAX_FILES = 5;
  const MAX_SIZE_MB = 8;

  function onFilesSelected(list) {
    setError("");
    setResult(null);
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    const combined = [...files.map((f) => f.file), ...incoming];
    if (combined.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} images.`);
      return;
    }

    const validated = incoming.map((f) => {
      if (!f.type.startsWith("image/")) {
        return { error: "Only images are allowed." };
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        return { error: `Each file must be smaller than ${MAX_SIZE_MB}MB.` };
      }
      return {
        file: f,
        preview: URL.createObjectURL(f),
        id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
    });

    const firstError = validated.find((v) => v.error);
    if (firstError) {
      setError(firstError.error);
      validated.forEach((v) => v.preview && URL.revokeObjectURL(v.preview));
      return;
    }

    setFiles((prev) => [...prev, ...validated]);
  }

  function handleInputChange(e) {
    onFilesSelected(e.target.files);
    e.target.value = null;
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    onFilesSelected(e.dataTransfer.files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function removeFile(id) {
    setFiles((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function startAnalysis() {
    if (files.length === 0) {
      setError("Please add at least one image to analyse.");
      return;
    }

    setError("");
    setProcessing(true);
    setProgress(10);
    setResult(null);

    const formData = new FormData();
    formData.append("image", files[0].file); // first image only

    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProgress(100);
        setResult({ success: true, message: data.result });
      } else {
        throw new Error(data.error || "Failed to analyze");
      }
    } catch (err) {
      setError("Error analyzing image: " + err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Analysis using AI</h2>
        <p className={styles.subtitle}>Disease and weed detection</p>
      </div>

      <main className={styles.card}>
        <div
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              fileInputRef.current && fileInputRef.current.click();
          }}
          aria-label="Upload images"
        >
          <div className={styles.dropInner}>
            <div className={styles.iconWrap}>
              <FiUploadCloud size={28} />
            </div>
            <div className={styles.dropText}>
              <div>Upload a leaf image to detect possible diseases.</div>
              <div className={styles.hint}>
                <FiInfo size={14} /> Supported: JPG, PNG. Max 5 files, {MAX_SIZE_MB}MB each.
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className={styles.fileInput}
            aria-hidden="true"
          />
        </div>

        <div className={styles.previewRow}>
          {files.length === 0 ? (
            <div className={styles.placeholder}>No files selected</div>
          ) : (
            files.map((f) => (
              <div className={styles.thumb} key={f.id}>
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className={styles.thumbImg}
                />
                <div className={styles.thumbMeta}>
                  <div className={styles.fileName} title={f.file.name}>
                    {f.file.name}
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFile(f.id)}
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <label className={styles.fakeInput}>
            <span className={styles.chooseText}>Choose image(s)</span>
            <span className={styles.fileCount}>
              {files.length > 0
                ? `${files.length} file(s)`
                : "No file chosen"}
            </span>
            <input
              ref={fileInputRef}
              className={styles.hiddenFileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
            />
          </label>

          <button
            className={`${styles.primaryBtn} ${processing ? styles.busy : ""}`}
            onClick={startAnalysis}
            disabled={processing}
            aria-busy={processing}
          >
            {processing ? (
              <span className={styles.btnInner}>
                <FiLoader className={styles.spin} /> Analysing...
              </span>
            ) : (
              <span className={styles.btnspan}>
                Start analytic with AI <BsStars />
              </span>
            )}
          </button>
        </div>

        {processing && (
          <div className={styles.progressWrap} aria-hidden={!processing}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progressLabel}>
              Processing — {progress}%
            </div>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <div className={styles.resultIcon}>
              <FiCheck />
            </div>
            <div className={styles.resultText}>
              <strong>Disease Analysis Result</strong>
              <div className={styles.resultMsg}>{result.message}</div>
            </div>
          </div>
        )}
      </main>

      <Navbar />
    </div>
  );
}

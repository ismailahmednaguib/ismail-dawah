// components/download/CopyLinkButton.tsx
"use client";

import { useCallback, useState } from "react";

type CopyLinkButtonProps = {
  url: string;
  label: string;
  copiedLabel: string;
  className?: string;
};

async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) {
    throw new Error("Empty text");
  }

  if (typeof window === "undefined") {
    throw new Error("Window is not available");
  }

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  const successful = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error("Copy command failed");
  }
}

export default function CopyLinkButton({
  url,
  label,
  copiedLabel,
  className = "",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = useCallback(async () => {
    setError(false);

    try {
      await copyTextToClipboard(url);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.warn("[CopyLinkButton] copy failed:", copyError);
      setError(true);

      window.setTimeout(() => {
        setError(false);
      }, 2500);
    }
  }, [url]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!url}
      className={className}
      aria-live="polite"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>

      {error ? "تعذر النسخ" : copied ? copiedLabel : label}
    </button>
  );
}
"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FieldTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pills" | "cards";
  className?: string;
}

export default function FieldTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "pills",
  className = "",
}: FieldTabsProps) {
  // ===== Variant: Pills (الافتراضي) =====
  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
              transition-all duration-200 cursor-pointer
              ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                  : "bg-white text-slate-600 hover:bg-primary-50 hover:text-primary-700 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700 border border-slate-200 dark:border-night-700"
              }
            `}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  rounded-full px-2 py-0.5 text-xs font-bold
                  ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // ===== Variant: Underline =====
  if (variant === "underline") {
    return (
      <div className={`border-b border-slate-200 dark:border-night-700 ${className}`}>
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-semibold
                transition-colors duration-200 cursor-pointer
                ${
                  activeTab === tab.id
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }
              `}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {tab.count}
                </span>
              )}
              {/* الخط السفلي */}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ===== Variant: Cards =====
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex flex-col items-center gap-2 rounded-2xl p-4 text-center
            transition-all duration-200 cursor-pointer
            ${
              activeTab === tab.id
                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02]"
                : "bg-white text-slate-600 hover:bg-primary-50 dark:bg-night-800 dark:text-slate-300 dark:hover:bg-night-700 border border-slate-200 dark:border-night-700"
            }
          `}
        >
          {tab.icon && (
            <span className={`text-2xl ${activeTab === tab.id ? "scale-110" : ""} transition-transform`}>
              {tab.icon}
            </span>
          )}
          <span className="text-sm font-semibold">{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`
                rounded-full px-2 py-0.5 text-xs font-bold
                ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Send,
  User,
  AlertCircle,
} from "lucide-react";
import { ReviewModerationNote } from "@/types/admin/review";

interface InternalNotesWidgetProps {
  notes: ReviewModerationNote[];
  onAddNote: (note: string) => Promise<any>;
  isLoading?: boolean;
}

export function InternalNotesWidget({
  notes,
  onAddNote,
  isLoading,
}: InternalNotesWidgetProps) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) {
      setError("Please enter an internal note.");
      return;
    }
    if (newNote.trim().length < 5) {
      setError("Note must be at least 5 characters.");
      return;
    }
    if (newNote.trim().length > 500) {
      setError("Note cannot exceed 500 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddNote(newNote.trim());
      setNewNote("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add note";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
            Team Moderation Notes
          </h3>
        </div>
        <span className="text-[11px] text-on-surface-variant font-mono">
          {notes.length} note{notes.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Existing Notes List */}
      <div className="space-y-3 mb-4">
        {notes.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-2 italic text-center">
            No internal team notes recorded for this review yet.
          </p>
        ) : (
          notes.map((n) => {
            const formattedDate = new Date(n.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={n.id}
                className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <User className="w-3 h-3 text-primary" />
                    {n.createdBy}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {formattedDate}
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  {n.note}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="pt-3 border-t border-outline-variant/20 space-y-2">
        {error && (
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Add internal moderation note (5–500 chars)..."
            className="w-full p-2.5 bg-surface-container text-xs rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-on-surface-variant font-mono">
            {newNote.length}/500 chars
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !newNote.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? "Adding..." : "Add Note"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

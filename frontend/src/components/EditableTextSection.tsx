import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface EditableTextSectionProps {
  id: string;
  label: string;
  value: string | null | undefined;
  maxLength: number;
  placeholder: string;
  emptyText: string;
  addLabel: string;
  editLabel: string;
  saveLabel: string;
  deleteLabel: string;
  onSave: (value: string) => void;
  // Taller textarea and a scrollable view for long texts
  large?: boolean;
}

// A block of text that is shown read-only and can be edited, saved or deleted in place.
// Used for both the note and the sent application text.
export function EditableTextSection({
  id,
  label,
  value,
  maxLength,
  placeholder,
  emptyText,
  addLabel,
  editLabel,
  saveLabel,
  deleteLabel,
  onSave,
  large = false,
}: EditableTextSectionProps) {
  const savedText = value?.trim() ?? "";
  const hasText = savedText.length > 0;

  const [draft, setDraft] = useState(savedText);
  const [isEditing, setIsEditing] = useState(false);

  // Keep the draft in sync when the saved value changes
  useEffect(() => {
    setDraft(savedText);
    setIsEditing(false);
  }, [savedText]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(savedText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setDraft("");
    setIsEditing(false);
    onSave("");
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={large ? "min-h-64 resize-y" : "min-h-32 resize-none"}
          autoFocus
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {draft.length} / {maxLength}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Avbryt
            </Button>
            <Button type="submit">{saveLabel}</Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <section className="space-y-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      {hasText ? (
        <p
          className={
            large
              ? "max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-secondary/50 p-3 text-sm leading-6"
              : "whitespace-pre-wrap text-sm leading-6"
          }
        >
          {savedText}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
          {hasText ? editLabel : addLabel}
        </Button>
        {hasText && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {deleteLabel}
          </Button>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { useEffect, useState, useRef } from "react";
import { uploadBlogImage } from "@/app/admin/actions/blog-images";
import { toast } from "sonner";

type Props = {
  name: string;
  initialHtml: string;
  placeholder?: string;
};

export function RichTextEditor({ name, initialHtml, placeholder }: Props) {
  const [html, setHtml] = useState(initialHtml || "<p></p>");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your article…" }),
      Image,
    ],
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => setHtml(ed.getHTML()),
  });

  useEffect(() => {
    if (editor && initialHtml) {
      editor.commands.setContent(initialHtml);
      setHtml(initialHtml);
    }
  }, [editor, initialHtml]);

  if (!editor) return <div className="min-h-[200px] rounded border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm text-[var(--color-muted)]">Loading editor…</div>;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-t border border-b-0 border-[var(--color-border)] bg-[var(--color-card)] p-2">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="S" />
        <span className="mx-1 w-px bg-[var(--color-border)]" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="• List" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1. List" />
        <span className="mx-1 w-px bg-[var(--color-border)]" />
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--color-border)]"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;
            setUploading(true);
            try {
              const fd = new FormData();
              fd.set("file", file);
              const r = await uploadBlogImage(null, fd);
              if (r?.url) {
                editor.chain().focus().setImage({ src: r.url }).run();
                toast.success("Image inserted");
              } else {
                toast.error(r?.error || "Upload failed");
              }
            } catch (err) {
              toast.error("Upload failed");
            } finally {
              setUploading(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }}
        />
        <button
          type="button"
          disabled={uploading}
          className="rounded px-2 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--color-border)] disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Insert image"}
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[280px] rounded-b border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none"
      />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function ToolbarBtn({
  onClick,
  active,
  label,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${
        active ? "bg-[var(--color-primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--color-border)]"
      }`}
    >
      {label}
    </button>
  );
}

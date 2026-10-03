"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
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
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
      }),
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

  useEffect(() => {
    function handleQuote(e: Event) {
      if (!editor) return;
      const ce = e as CustomEvent<{ html: string }>;
      if (ce.detail?.html) {
        editor.chain().focus().insertContent(ce.detail.html).run();
      }
    }
    window.addEventListener("forum-quote", handleQuote);
    return () => window.removeEventListener("forum-quote", handleQuote);
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-sm text-[var(--color-muted)]">
        Loading editor…
      </div>
    );
  }

  const ed = editor;

  function setLink() {
    const previous = ed.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      ed.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    ed.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t border border-b-0 border-[var(--color-border)] bg-[var(--color-card)] p-2">
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
        />
        <Sep />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph") && !editor.isActive("heading")}
          label="Text"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          label="H2"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          label="H3"
        />
        <Sep />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          label="Underline"
        />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strike" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          label="Highlight"
        />
        <Sep />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          label="Left"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          label="Centre"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          label="Right"
        />
        <Sep />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="• List"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="1. List"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Quote"
        />
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Line" />
        <Sep />
        <ToolbarBtn onClick={setLink} active={editor.isActive("link")} label="Link" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          label="Unlink"
        />
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
            } catch {
              toast.error("Upload failed");
            } finally {
              setUploading(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }}
        />
        <ToolbarBtn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          label={uploading ? "Uploading…" : "Image"}
        />
        <Sep />
        <ToolbarBtn
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          label="Clear"
        />
      </div>
      <EditorContent
        editor={editor}
        className="rich-editor min-h-[280px] rounded-b border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none"
      />
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function Sep() {
  return <span className="mx-1 hidden h-5 w-px bg-[var(--color-border)] sm:inline-block" />;
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-40 ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "text-[var(--foreground)] hover:bg-[var(--color-border)]"
      }`}
    >
      {label}
    </button>
  );
}

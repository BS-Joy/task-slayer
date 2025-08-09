"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-3 dark:prose-invert",
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;

    // Empty
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkModalOpen(false);
      setLinkUrl("");
      return;
    }

    // Update link
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
    setIsLinkModalOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const unsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-md">
        <div className="border-b bg-muted/50 p-2">
          <div className="h-8 bg-muted animate-pulse rounded" />
        </div>
        <div className="min-h-[120px] p-3 bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`h-8 px-2 ${
            editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`h-8 px-2 ${
            editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`h-8 px-2 ${
            editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 px-2 ${editor.isActive("bold") ? "bg-accent" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 px-2 ${editor.isActive("italic") ? "bg-accent" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 px-2 ${
            editor.isActive("underline") ? "bg-accent" : ""
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 px-2 ${editor.isActive("strike") ? "bg-accent" : ""}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`h-8 px-2 ${editor.isActive("code") ? "bg-accent" : ""}`}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 px-2 ${
            editor.isActive("bulletList") ? "bg-accent" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 px-2 ${
            editor.isActive("orderedList") ? "bg-accent" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 px-2 ${
            editor.isActive("blockquote") ? "bg-accent" : ""
          }`}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Popover open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={setLink}
              className={`h-8 px-2 ${
                editor.isActive("link") ? "bg-accent" : ""
              }`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add Link</h4>
                <p className="text-sm text-muted-foreground">
                  Enter the URL for the link.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSetLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSetLink} size="sm" className="flex-1">
                    {editor.isActive("link") ? "Update Link" : "Add Link"}
                  </Button>
                  {editor.isActive("link") && (
                    <Button onClick={unsetLink} variant="outline" size="sm">
                      <Unlink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <div className={`${disabled ? "bg-muted/50" : "bg-background"}`}>
        <EditorContent
          editor={editor}
          className="min-h-[120px]"
          placeholder={placeholder}
        />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }

        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror p {
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
        }

        .ProseMirror blockquote {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          border-left: 3px solid hsl(var(--border));
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
            "Liberation Mono", Menlo, monospace;
        }

        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          opacity: 0.8;
        }

        /* Focus styles */
        .ProseMirror:focus {
          outline: none;
        }

        /* Selection styles */
        .ProseMirror ::selection {
          background: hsl(var(--accent));
        }

        /* Placeholder styles */
        .ProseMirror[data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
}

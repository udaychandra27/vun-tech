import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Youtube from "@tiptap/extension-youtube"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { Node, mergeAttributes } from "@tiptap/core"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  SquareDashedBottomCode,
  Underline as UnderlineIcon,
  Undo2,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const CalloutBlock = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-callout="info"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-callout": "info",
        class: "blog-callout rounded-2xl border border-moss/20 bg-moss/5 px-5 py-4",
      }),
      0,
    ]
  },
  addCommands() {
    return {
      insertCallout:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Callout box content" }],
              },
            ],
          }),
    }
  },
})

const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attrs) => ({ width: attrs.width || "100%" }),
      },
      caption: {
        default: "",
        renderHTML: (attrs) => ({
          "data-caption": attrs.caption || "",
        }),
      },
      align: {
        default: "center",
        renderHTML: (attrs) => ({
          style:
            attrs.align === "left"
              ? "display:block;margin-right:auto"
              : attrs.align === "right"
                ? "display:block;margin-left:auto"
                : "display:block;margin-left:auto;margin-right:auto",
        }),
      },
    }
  },
  addNodeView() {
    return ({ node }) => {
      const image = document.createElement("img")
      image.src = node.attrs.src
      image.alt = node.attrs.alt || ""
      image.className = "rounded-2xl"
      image.style.width = node.attrs.width || "100%"
      image.style.display = "block"
      image.style.marginLeft =
        node.attrs.align === "right" ? "auto" : node.attrs.align === "left" ? "0" : "auto"
      image.style.marginRight =
        node.attrs.align === "left" ? "auto" : node.attrs.align === "right" ? "0" : "auto"

      const caption = document.createElement("div")
      caption.className = "mt-2 text-center text-xs text-slate-500"
      caption.textContent = node.attrs.caption || ""

      const wrapper = document.createElement("div")
      wrapper.className = "my-4"
      wrapper.appendChild(image)
      if (node.attrs.caption) {
        wrapper.appendChild(caption)
      }

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== node.type.name) return false
          image.src = updatedNode.attrs.src
          image.alt = updatedNode.attrs.alt || ""
          image.style.width = updatedNode.attrs.width || "100%"
          caption.textContent = updatedNode.attrs.caption || ""
          if (updatedNode.attrs.caption && !caption.isConnected) {
            wrapper.appendChild(caption)
          }
          if (!updatedNode.attrs.caption && caption.isConnected) {
            caption.remove()
          }
          return true
        },
        selectNode: () => {
          wrapper.classList.add("ring-2", "ring-moss")
        },
        deselectNode: () => {
          wrapper.classList.remove("ring-2", "ring-moss")
        },
        stopEvent: () => false,
      }
    }
  },
})

function ToolbarButton({ active = false, children, className = "", ...props }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className={cn("h-9 px-3", className)}
      {...props}
    >
      {children}
    </Button>
  )
}

export function BlogEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = "Write your post...",
}) {
  const [linkUrl, setLinkUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      RichImage,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({ placeholder }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      CalloutBlock,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[380px] rounded-b-3xl border border-t-0 border-fog bg-white px-5 py-5 outline-none",
      },
      handleDrop(view, event, slice, moved) {
        if (moved || !onUploadImage) return false
        const file = event.dataTransfer?.files?.[0]
        if (!file?.type.startsWith("image/")) return false
        event.preventDefault()
        onUploadImage(file).then((src) => {
          if (!src) return
          const position = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })
          editor?.chain().focus().insertContentAt(position?.pos || undefined, {
            type: "image",
            attrs: { src, width: "100%", caption: "", align: "center" },
          }).run()
        })
        return true
      },
      handlePaste(view, event) {
        if (!onUploadImage) return false
        const file = event.clipboardData?.files?.[0]
        if (!file?.type.startsWith("image/")) return false
        event.preventDefault()
        onUploadImage(file).then((src) => {
          if (!src) return
          editor?.chain().focus().insertContent({
            type: "image",
            attrs: { src, width: "100%", caption: "", align: "center" },
          }).run()
        })
        return true
      },
    },
    onUpdate({ editor: nextEditor }) {
      onChange(nextEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false)
    }
  }, [editor, value])

  if (!editor) {
    return <div className="rounded-3xl border border-fog bg-white p-5 text-sm text-slate">Loading editor...</div>
  }

  const updateSelectedImage = (attrs) => {
    editor.chain().focus().updateAttributes("image", attrs).run()
  }

  const insertImage = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !onUploadImage) return
      const src = await onUploadImage(file)
      if (!src) return
      editor.chain().focus().setImage({ src, width: "100%", caption: "", align: "center" }).run()
    }
    input.click()
  }

  const promptForLink = () => {
    const previousUrl = editor.getAttributes("link").href || linkUrl
    const nextUrl = window.prompt("Enter a URL", previousUrl)
    if (nextUrl === null) return
    if (!nextUrl) {
      editor.chain().focus().unsetLink().run()
      return
    }
    setLinkUrl(nextUrl)
    editor.chain().focus().extendMarkRange("link").setLink({ href: nextUrl }).run()
  }

  const promptForYoutube = () => {
    const src = window.prompt("Paste a YouTube URL")
    if (!src) return
    editor.chain().focus().setYoutubeVideo({
      src,
      width: 960,
      height: 540,
    }).run()
  }

  const promptForCaption = () => {
    const currentCaption = editor.getAttributes("image").caption || ""
    const nextCaption = window.prompt("Image caption", currentCaption)
    if (nextCaption === null) return
    updateSelectedImage({ caption: nextCaption })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-fog bg-white p-3">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            <SquareDashedBottomCode className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={promptForLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={promptForYoutube}>
            <Video className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().insertCallout().run()}>
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {editor.isActive("image") ? (
          <div className="mt-3 grid gap-3 rounded-2xl bg-sand p-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
            <Input
              placeholder="Selected image alt text"
              value={editor.getAttributes("image").alt || ""}
              onChange={(event) => updateSelectedImage({ alt: event.target.value })}
            />
            <ToolbarButton onClick={promptForCaption}>Caption</ToolbarButton>
            <ToolbarButton onClick={() => updateSelectedImage({ width: "50%" })}>50%</ToolbarButton>
            <ToolbarButton onClick={() => updateSelectedImage({ width: "75%" })}>75%</ToolbarButton>
            <ToolbarButton onClick={() => updateSelectedImage({ width: "100%" })}>100%</ToolbarButton>
          </div>
        ) : null}
      </div>

      <EditorContent editor={editor} />
      <p className="text-xs text-slate">
        Drag and drop images directly into the editor. Use the image controls for captions and width.
      </p>
    </div>
  )
}

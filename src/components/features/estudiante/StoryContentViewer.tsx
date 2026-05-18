'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface StoryContentViewerProps {
  content: string
  className?: string
}

export default function StoryContentViewer({ content, className = '' }: StoryContentViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none ${className}`,
      },
    },
  })

  return <EditorContent editor={editor} />
}

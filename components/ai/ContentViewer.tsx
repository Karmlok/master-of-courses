'use client'

interface ContentViewerProps {
  content: string
  editable?: boolean
  onChange?: (value: string) => void
}

export function ContentViewer({ content, editable, onChange }: ContentViewerProps) {
  if (editable) {
    return (
      <textarea
        className="w-full min-h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] resize-y leading-relaxed"
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Modifica il contenuto HTML qui..."
      />
    )
  }

  return (
    <div
      className="ai-content p-6 bg-white rounded-lg min-h-16"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

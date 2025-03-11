import { Button } from '@0xintuition/1ui'

// duplicating this for easy reference and understanding
export const TAG_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: '16776', label: 'AI' },
  { id: '16789', label: 'DEFI' },
] as const

export default function TagFilter({
  selectedTags,
  onTagChange,
}: {
  selectedTags: string[]
  onTagChange: (tags: string[]) => void
}) {
  const handleTagClick = (tagId: string) => {
    // If clicking "All", clear other selections
    if (tagId === 'all') {
      onTagChange(['all'])
      return
    }

    // If clicking another tag while "All" is selected, switch to that tag
    if (selectedTags.includes('all')) {
      onTagChange([tagId])
      return
    }

    // If clicking the currently selected tag, switch back to "All"
    if (selectedTags.includes(tagId)) {
      onTagChange(['all'])
      return
    }

    // Otherwise, select the new tag
    onTagChange([tagId])
  }

  return (
    <div className="flex gap-2 mb-4">
      {TAG_OPTIONS.map((tag) => (
        <Button
          key={tag.id}
          variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
          className={`rounded-full px-6 py-2 text-base ${
            selectedTags.includes(tag.id)
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-primary/20 hover:bg-primary/10'
          }`}
          onClick={() => handleTagClick(tag.id)}
        >
          {tag.label}
        </Button>
      ))}
    </div>
  )
}

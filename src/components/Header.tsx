import { Text } from '@0xintuition/1ui'
import { AuthButton } from '@/components/AuthButton'

export function Header() {
  return (
    <header className="mb-8 flex justify-between items-center">
      <div>
        <Text variant="heading5">Intuition Market Template</Text>
        <Text variant="body" className="text-gray-600">
          The market platform app template, powered by Intuition Systems
        </Text>
      </div>
      <AuthButton />
    </header>
  )
}

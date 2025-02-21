import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Button } from '@0xintuition/1ui'

export function AuthButton() {
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext()

  return (
    <div className="flex items-center gap-2">
      {primaryWallet ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {primaryWallet.address?.slice(0, 6)}...{primaryWallet.address?.slice(-4)}
          </span>
          <Button variant="secondary" onClick={handleLogOut}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button variant="primary" onClick={() => setShowAuthFlow(true)}>
          Connect your wallet
        </Button>
      )}
    </div>
  )
}

import GameContainer from "@/components/game/game-container"
import { ItemManagerProvider } from "@/lib/item-manager-context"

export default function Home() {
  return (
    <ItemManagerProvider>
      <main className="w-screen h-screen overflow-hidden bg-black relative" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
        <GameContainer />
      </main>
    </ItemManagerProvider>
  )
}

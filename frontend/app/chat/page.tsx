import { AIMentorChat } from "@/components/ai-mentor-chat"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, Coins, Trophy } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
  const handleLessonComplete = (lessonId: string) => {
    console.log("[v0] Lesson completed:", lessonId)
    // This would typically trigger achievement unlocking, progress tracking, etc.
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-heading font-bold text-xl">SuperLearn</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Learning Session</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl">Chat with Alex</h1>
            <p className="text-muted-foreground">
              Your AI mentor is here to guide you through your crypto learning journey!
            </p>
          </div>

          <AIMentorChat childName="Student" onLessonComplete={handleLessonComplete} />

          <div className="text-center space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-heading font-semibold text-sm">Learn Concepts</h3>
                <p className="text-xs text-muted-foreground">Understand crypto basics</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-heading font-semibold text-sm">Practice Safely</h3>
                <p className="text-xs text-muted-foreground">Try real transactions</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-heading font-semibold text-sm">Earn Achievements</h3>
                <p className="text-xs text-muted-foreground">Collect NFT certificates</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

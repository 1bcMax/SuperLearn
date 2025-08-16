#!/bin/bash

echo "🎓 Starting SuperLearn Demo..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping demo..."
    kill $UAGENT_PID $NEXT_PID $FLOW_PID 2>/dev/null
    echo "Demo stopped."
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM

# Start Flow emulator if not running
if ! pgrep -f "flow emulator" > /dev/null; then
    echo "⚡ Starting Flow emulator..."
    flow emulator start --init &
    FLOW_PID=$!
    sleep 5
    
    echo "🚀 Deploying contracts..."
    flow project deploy --network emulator
else
    echo "⚡ Flow emulator already running"
fi

# Start uAgent in background
echo "🤖 Starting AI Mentor uAgent..."
python3 agents/ai_mentor.py &
UAGENT_PID=$!
sleep 3

# Start Next.js frontend
echo "🌐 Starting frontend..."
npm run dev &
NEXT_PID=$!

echo ""
echo "🎉 SuperLearn Demo is starting up!"
echo ""
echo "📍 Access the demo at: http://localhost:3000"
echo "🤖 AI Mentor running at: http://localhost:8000"
echo "⚡ Flow emulator at: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop the demo"
echo ""

# Wait for processes
wait
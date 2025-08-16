#!/bin/bash

echo "🎓 Setting up SuperLearn Demo Environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking required tools..."
check_tool "node"
check_tool "npm"
check_tool "python3"
check_tool "pip3"
check_tool "flow"

echo ""
echo "📦 Installing Node.js dependencies..."
npm install

echo ""
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements.txt

echo ""
echo "⚡ Setting up Flow emulator..."
# Start Flow emulator in background if not already running
if ! pgrep -f "flow emulator" > /dev/null; then
    echo "Starting Flow emulator..."
    flow emulator start --init &
    FLOW_PID=$!
    echo "Flow emulator started with PID: $FLOW_PID"
    sleep 5
else
    echo "Flow emulator is already running"
fi

echo ""
echo "🚀 Deploying SuperLearn contracts..."
flow project deploy --network emulator

echo ""
echo "📝 Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "Created .env.local - please update with your API keys"
else
    echo ".env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the demo:"
echo "1. Terminal 1: npm run uagent     # Start AI mentor"
echo "2. Terminal 2: npm run dev       # Start frontend"
echo "3. Open http://localhost:3000"
echo ""
echo "📧 Don't forget to:"
echo "- Set NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID in .env.local"
echo "- Set OPENAI_API_KEY in .env.local"
echo ""
echo "🌟 SuperLearn is ready for demo!"
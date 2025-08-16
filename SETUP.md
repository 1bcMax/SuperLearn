# 🚀 SuperLearn Setup Guide

## Quick Setup (5 minutes)

### 1. Dynamic Wallet Configuration
The wallet creation requires a Dynamic account:

1. **Sign up at [Dynamic](https://app.dynamic.xyz/)**
   - Create a free account
   - Create a new project

2. **Get your Environment ID**
   - Go to your project dashboard
   - Copy the "Environment ID" 

3. **Update Environment File**
   ```bash
   # Edit .env.local
   NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_real_environment_id_here
   ```

4. **Restart Development Server**
   ```bash
   npm run dev
   ```

### 2. AI Mentor Configuration (Optional)
For the AI mentor to work:

1. **Get OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key

2. **Update Environment File**
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start AI Agent**
   ```bash
   npm run uagent
   ```

### 3. Flow Blockchain (Optional)
For real blockchain transactions:

1. **Install Flow CLI**
   ```bash
   brew install flow-cli
   ```

2. **Start Flow Emulator**
   ```bash
   npm run flow:emulator
   ```

## Troubleshooting

### Wallet Creation Shows Blank Popup
- ✅ Check Dynamic Environment ID is set correctly
- ✅ Restart development server after changing .env.local
- ✅ Ensure you're using a real Dynamic Environment ID (not demo_env_id)

### AI Mentor Not Responding
- ✅ Check OpenAI API Key is set
- ✅ Check console for error messages

### Styling Issues
- ✅ Run `npm install` to ensure all dependencies are installed
- ✅ Check Tailwind CSS is building correctly
- ✅ Clear browser cache and reload

## Demo Mode
The app works in demo mode even without full configuration:
- Progress tracking works
- UI animations work  
- Wallet creation shows setup instructions
- Educational content is available

## Need Help?
- Check browser console for error messages
- Ensure all environment variables are set
- Restart development server after configuration changes
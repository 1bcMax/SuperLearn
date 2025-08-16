import os
import json
from typing import Dict, Any
from uagents import Agent, Context, Protocol, Model
from pydantic import BaseModel, Field
from openai import OpenAI
import asyncio

# Environment setup
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AGENT_SEED = "superlearn_ai_mentor_seed_2024"

# Initialize the AI Mentor Agent
ai_mentor = Agent(
    name="SuperLearn_AI_Mentor",
    seed=AGENT_SEED,
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

class LearningRequest(BaseModel):
    user_id: str = Field(description="Unique identifier for the user")
    user_name: str = Field(description="User's display name")
    lesson_stage: str = Field(description="Current lesson stage: intro, wallet, transaction, verification")
    user_input: str = Field(description="User's response or question", default="")

class LearningResponse(BaseModel):
    message: str = Field(description="AI mentor's educational response")
    next_action: str = Field(description="Next step for user: continue, wait_for_input, create_wallet, send_transaction")
    lesson_data: Dict[str, Any] = Field(description="Additional lesson data", default_factory=dict)

class TransactionGuide(BaseModel):
    user_id: str = Field(description="User identifier")
    wallet_address: str = Field(description="User's wallet address")
    transaction_type: str = Field(description="Type of transaction to guide")

class TransactionResult(BaseModel):
    success: bool = Field(description="Whether transaction was successful")
    transaction_id: str = Field(description="Transaction hash/ID")
    next_lesson: str = Field(description="Next lesson stage")

# Learning curriculum data
CURRICULUM = {
    "intro": {
        "title": "Welcome to Crypto Adventure!",
        "content": "Hi there! I'm your AI crypto mentor. We're going to learn about cryptocurrency by actually using it safely. Are you ready to start your crypto journey?",
        "questions": [
            "What do you think cryptocurrency is?",
            "Have you ever heard of Bitcoin or other digital money?",
            "What would you like to learn about crypto?"
        ]
    },
    "wallet": {
        "title": "Your Digital Wallet",
        "content": "Great! First, we need to create your digital wallet. Think of it like a special digital backpack that holds your crypto coins. The cool thing is, you don't need to remember any complicated passwords!",
        "concepts": ["digital wallet", "safe storage", "easy access"]
    },
    "transaction": {
        "title": "Your First Transaction",
        "content": "Now let's send your first crypto transaction! We'll send a small amount of testnet FLOW tokens. This is like practice money - it's not real money, so it's completely safe to learn with.",
        "steps": [
            "Choose how much to send (we'll start with 0.1 FLOW)",
            "Pick a destination address",
            "Review the transaction",
            "Send it and watch it happen!"
        ]
    },
    "verification": {
        "title": "Proof of Learning",
        "content": "Awesome! You just completed your first blockchain transaction. Now let's verify your new skill and earn your 'Crypto Explorer' certificate as an NFT!",
        "achievement": "First Transaction Master"
    }
}

@ai_mentor.on_event("startup")
async def mentor_startup(ctx: Context):
    ctx.logger.info(f"🚀 SuperLearn AI Mentor started!")
    ctx.logger.info(f"📚 Ready to teach crypto skills to young learners")
    ctx.logger.info(f"🔗 Agent address: {ai_mentor.address}")

def get_openai_response(prompt: str, lesson_context: str = "") -> str:
    """Get educational response from OpenAI"""
    if not OPENAI_API_KEY:
        return "I'm still learning! Please set up my AI connection to continue."
    
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        system_prompt = f"""You are a friendly AI mentor teaching kids (ages 10-16) about cryptocurrency and blockchain technology. 

TEACHING CONTEXT: {lesson_context}

GUIDELINES:
- Use simple, age-appropriate language
- Make complex concepts fun and relatable
- Encourage questions and exploration  
- Keep responses to 2-3 sentences max
- Use encouraging, positive tone
- Relate crypto concepts to familiar things (like digital games, apps, etc.)
- Focus on practical learning through doing
- Always emphasize safety and that we're using "practice money"

CURRENT LESSON FOCUS: Help them understand the current step and guide them to the next action."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        return f"I'm having trouble thinking right now. Let's try again! (Error: {str(e)[:50]})"

@ai_mentor.on_message(model=LearningRequest, replies=LearningResponse)
async def handle_learning_session(ctx: Context, sender: str, msg: LearningRequest):
    """Main learning session handler"""
    ctx.logger.info(f"📖 Learning session for {msg.user_name} (stage: {msg.lesson_stage})")
    
    # Get curriculum data for current stage
    stage_data = CURRICULUM.get(msg.lesson_stage, CURRICULUM["intro"])
    
    # Create context for AI response
    lesson_context = f"""
    STAGE: {msg.lesson_stage}
    CURRICULUM: {stage_data}
    USER INPUT: {msg.user_input}
    USER: {msg.user_name}
    """
    
    # Determine the prompt based on lesson stage
    if msg.lesson_stage == "intro":
        if msg.user_input:
            prompt = f"The student {msg.user_name} said: '{msg.user_input}'. Respond to their answer and guide them toward creating their first digital wallet."
        else:
            prompt = f"Introduce cryptocurrency learning to {msg.user_name}. Ask them what they know about digital money to gauge their starting level."
        next_action = "wait_for_input"
        
    elif msg.lesson_stage == "wallet":
        prompt = f"Explain digital wallets to {msg.user_name} in simple terms. They're about to create their first wallet with just their email - no complicated passwords needed!"
        next_action = "create_wallet"
        
    elif msg.lesson_stage == "transaction":
        prompt = f"Guide {msg.user_name} through their first crypto transaction. Explain we're using safe 'practice money' (testnet FLOW) and walk them through the steps."
        next_action = "send_transaction"
        
    elif msg.lesson_stage == "verification":
        prompt = f"Celebrate {msg.user_name}'s success! They just completed their first blockchain transaction. Explain how they're earning a special NFT certificate to prove their new skills."
        next_action = "continue"
        
    else:
        prompt = f"Help {msg.user_name} with their crypto learning question: {msg.user_input}"
        next_action = "wait_for_input"
    
    # Get AI response
    ai_response = get_openai_response(prompt, lesson_context)
    
    # Prepare lesson data
    lesson_data = {
        "stage": msg.lesson_stage,
        "curriculum": stage_data,
        "progress": {
            "intro": msg.lesson_stage in ["wallet", "transaction", "verification"],
            "wallet": msg.lesson_stage in ["transaction", "verification"], 
            "transaction": msg.lesson_stage in ["verification"],
            "verification": msg.lesson_stage == "verification"
        }
    }
    
    # Send response
    response = LearningResponse(
        message=ai_response,
        next_action=next_action,
        lesson_data=lesson_data
    )
    
    await ctx.send(sender, response)
    ctx.logger.info(f"📤 Sent learning response to {msg.user_name}")

@ai_mentor.on_message(model=TransactionGuide, replies=TransactionResult)
async def guide_transaction(ctx: Context, sender: str, msg: TransactionGuide):
    """Guide user through blockchain transaction"""
    ctx.logger.info(f"💸 Guiding transaction for user {msg.user_id}")
    
    # In a real implementation, this would interact with Flow blockchain
    # For demo purposes, we'll simulate the guidance
    
    success = True  # Simulated success
    transaction_id = f"flow_tx_{msg.user_id}_{msg.wallet_address[:8]}"
    
    result = TransactionResult(
        success=success,
        transaction_id=transaction_id,
        next_lesson="verification"
    )
    
    await ctx.send(sender, result)
    ctx.logger.info(f"✅ Transaction guidance completed: {transaction_id}")

# Message handlers are already registered with @ai_mentor.on_message decorators

if __name__ == "__main__":
    print("🎓 Starting SuperLearn AI Mentor...")
    print("📧 Make sure to set OPENAI_API_KEY environment variable")
    print(f"🤖 Agent will be available at: http://localhost:8001")
    print(f"🔑 Agent address: {ai_mentor.address}")
    ai_mentor.run()
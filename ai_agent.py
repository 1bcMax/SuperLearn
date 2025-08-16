#!/usr/bin/env python3

from pydantic import BaseModel, Field
from uagents import Agent, Context
import json
import asyncio
from typing import Dict, Any

# Agent Configuration
agent = Agent(
    name="superlearn_ai_agent",
    seed="superlearn_secret_seed_phrase_2024",
    port=8002,
    endpoint=["http://localhost:8002/submit"]
)

class LearningRequest(BaseModel):
    topic: str = Field(description="The learning topic or question")
    user_level: str = Field(description="Beginner, Intermediate, or Advanced", default="Beginner")
    learning_style: str = Field(description="Visual, Auditory, Reading, or Kinesthetic", default="Visual")

class LearningResponse(BaseModel):
    explanation: str = Field(description="Educational explanation tailored to user level")
    key_points: list = Field(description="Key learning points")
    next_steps: list = Field(description="Suggested next learning steps")
    resources: list = Field(description="Additional learning resources")

class QuizRequest(BaseModel):
    topic: str = Field(description="Topic for quiz generation")
    difficulty: str = Field(description="easy, medium, or hard", default="medium")
    num_questions: int = Field(description="Number of questions", default=5)

class QuizResponse(BaseModel):
    questions: list = Field(description="List of quiz questions with options and answers")
    topic: str = Field(description="Quiz topic")

@agent.on_event("startup")
async def print_address(ctx: Context):
    ctx.logger.info(f"SuperLearn AI Agent started with address: {agent.address}")
    ctx.logger.info("Agent ready to help with learning requests!")

def generate_learning_content(topic: str, level: str, style: str) -> Dict[str, Any]:
    """Generate educational content based on topic and user preferences"""
    
    # Adaptive content based on level
    complexity_map = {
        "Beginner": "simple terms with basic examples",
        "Intermediate": "moderate complexity with practical applications", 
        "Advanced": "detailed technical depth with complex examples"
    }
    
    # Style-specific content delivery
    style_map = {
        "Visual": "with diagrams, charts, and visual metaphors",
        "Auditory": "with discussions, explanations, and verbal examples",
        "Reading": "with detailed text, definitions, and written materials",
        "Kinesthetic": "with hands-on activities and practical exercises"
    }
    
    # Generate content based on common topics
    if "blockchain" in topic.lower():
        explanation = f"Blockchain is a distributed ledger technology that maintains a continuously growing list of records. {complexity_map[level]} {style_map[style]}."
        key_points = [
            "Decentralized network of computers",
            "Immutable transaction records",
            "Cryptographic security",
            "Consensus mechanisms"
        ]
        next_steps = [
            "Learn about cryptocurrency basics",
            "Understand smart contracts",
            "Explore different blockchain platforms"
        ]
        resources = [
            "Blockchain fundamentals course",
            "Ethereum documentation",
            "Bitcoin whitepaper"
        ]
    elif "ai" in topic.lower() or "artificial intelligence" in topic.lower():
        explanation = f"Artificial Intelligence is the simulation of human intelligence in machines. {complexity_map[level]} {style_map[style]}."
        key_points = [
            "Machine learning algorithms",
            "Neural networks",
            "Data processing and analysis",
            "Pattern recognition"
        ]
        next_steps = [
            "Study machine learning basics",
            "Learn Python programming",
            "Practice with datasets"
        ]
        resources = [
            "Introduction to AI course",
            "Python machine learning tutorials",
            "Kaggle datasets and competitions"
        ]
    elif "programming" in topic.lower() or "coding" in topic.lower():
        explanation = f"Programming is the process of creating instructions for computers to follow. {complexity_map[level]} {style_map[style]}."
        key_points = [
            "Variables and data types",
            "Control structures (loops, conditions)",
            "Functions and methods",
            "Problem-solving approach"
        ]
        next_steps = [
            "Choose a programming language",
            "Practice with coding exercises",
            "Build small projects"
        ]
        resources = [
            "Interactive coding platforms",
            "Programming language documentation",
            "Open source projects on GitHub"
        ]
    else:
        # Generic educational content
        explanation = f"Let me help you learn about {topic}. {complexity_map[level]} {style_map[style]}."
        key_points = [
            f"Understanding the basics of {topic}",
            f"Key concepts in {topic}",
            f"Practical applications of {topic}",
            f"Common challenges in {topic}"
        ]
        next_steps = [
            f"Research fundamentals of {topic}",
            f"Find practical examples of {topic}",
            f"Connect with experts in {topic}"
        ]
        resources = [
            f"Online courses about {topic}",
            f"Books and articles on {topic}",
            f"Community forums for {topic}"
        ]
    
    return {
        "explanation": explanation,
        "key_points": key_points,
        "next_steps": next_steps,
        "resources": resources
    }

def generate_quiz(topic: str, difficulty: str, num_questions: int) -> Dict[str, Any]:
    """Generate quiz questions based on topic and difficulty"""
    
    questions = []
    
    if "blockchain" in topic.lower():
        if difficulty == "easy":
            questions = [
                {
                    "question": "What is a blockchain?",
                    "options": ["A type of database", "A distributed ledger", "A cryptocurrency", "A programming language"],
                    "correct": 1,
                    "explanation": "A blockchain is a distributed ledger that maintains a continuously growing list of records."
                },
                {
                    "question": "What makes blockchain secure?",
                    "options": ["Passwords", "Cryptography", "Firewalls", "Antivirus"],
                    "correct": 1,
                    "explanation": "Blockchain uses cryptographic hashing and digital signatures for security."
                }
            ]
        elif difficulty == "medium":
            questions = [
                {
                    "question": "What is a consensus mechanism?",
                    "options": ["A voting system", "A way to agree on network state", "A type of cryptocurrency", "A blockchain platform"],
                    "correct": 1,
                    "explanation": "Consensus mechanisms ensure all network participants agree on the current state."
                },
                {
                    "question": "What is the difference between proof-of-work and proof-of-stake?",
                    "options": ["Energy consumption", "Security model", "Validator selection", "All of the above"],
                    "correct": 3,
                    "explanation": "PoW and PoS differ in energy use, security approach, and how validators are chosen."
                }
            ]
    elif "ai" in topic.lower():
        if difficulty == "easy":
            questions = [
                {
                    "question": "What does AI stand for?",
                    "options": ["Advanced Intelligence", "Artificial Intelligence", "Automated Intelligence", "Algorithmic Intelligence"],
                    "correct": 1,
                    "explanation": "AI stands for Artificial Intelligence."
                },
                {
                    "question": "What is machine learning?",
                    "options": ["A type of AI", "A programming language", "A computer", "A website"],
                    "correct": 0,
                    "explanation": "Machine learning is a subset of artificial intelligence."
                }
            ]
    else:
        # Generic questions
        questions = [
            {
                "question": f"What is the main concept behind {topic}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0,
                "explanation": f"This relates to the fundamental principles of {topic}."
            }
        ]
    
    # Limit to requested number of questions
    questions = questions[:num_questions]
    
    return {
        "questions": questions,
        "topic": topic
    }

@agent.on_message(model=LearningRequest, replies=LearningResponse)
async def handle_learning_request(ctx: Context, sender: str, msg: LearningRequest):
    ctx.logger.info(f"Received learning request from {sender}: {msg.topic}")
    
    try:
        content = generate_learning_content(msg.topic, msg.user_level, msg.learning_style)
        
        response = LearningResponse(
            explanation=content["explanation"],
            key_points=content["key_points"],
            next_steps=content["next_steps"],
            resources=content["resources"]
        )
        
        ctx.logger.info(f"Sending learning response for topic: {msg.topic}")
        await ctx.send(sender, response)
        
    except Exception as e:
        ctx.logger.error(f"Error processing learning request: {e}")
        error_response = LearningResponse(
            explanation=f"I encountered an error while processing your request about {msg.topic}. Please try again.",
            key_points=["Error occurred during processing"],
            next_steps=["Please rephrase your question and try again"],
            resources=["Check your connection and retry"]
        )
        await ctx.send(sender, error_response)

@agent.on_message(model=QuizRequest, replies=QuizResponse)
async def handle_quiz_request(ctx: Context, sender: str, msg: QuizRequest):
    ctx.logger.info(f"Received quiz request from {sender}: {msg.topic}")
    
    try:
        quiz_data = generate_quiz(msg.topic, msg.difficulty, msg.num_questions)
        
        response = QuizResponse(
            questions=quiz_data["questions"],
            topic=quiz_data["topic"]
        )
        
        ctx.logger.info(f"Sending quiz response for topic: {msg.topic}")
        await ctx.send(sender, response)
        
    except Exception as e:
        ctx.logger.error(f"Error processing quiz request: {e}")
        error_response = QuizResponse(
            questions=[{
                "question": "What would you like to learn about?",
                "options": ["Try again", "Ask for help", "Choose different topic", "Contact support"],
                "correct": 0,
                "explanation": "There was an error generating your quiz. Please try again."
            }],
            topic=msg.topic
        )
        await ctx.send(sender, error_response)

if __name__ == "__main__":
    print("Starting SuperLearn AI Agent...")
    print(f"Agent Address: {agent.address}")
    print("Visit: http://localhost:8002 to see agent status")
    agent.run()
#!/usr/bin/env python3

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from typing import Dict, Any
import asyncio
import threading
import time

app = Flask(__name__)
CORS(app)

# Configuration
AGENT_URL = "http://localhost:8002/submit"
BRIDGE_PORT = 8001

class AgentBridge:
    def __init__(self):
        self.agent_address = None
        self.bridge_address = "agent1qv2j3h4h5h6h7h8h9h0hakdlsa8f9asdf98as7d6f5g4h3j2k1l0m"  # Placeholder
        
    def send_to_agent(self, message_data: Dict[str, Any], message_type: str) -> Dict[str, Any]:
        """Send message to the AI agent and return response"""
        try:
            payload = {
                "version": 1,
                "sender": self.bridge_address,
                "target": self.agent_address or "agent1qdpzrc02a8lnlzaahtdyy3wnaux64pqa22vykp59tx67jx2mmy3dzf249jk",
                "session": str(int(time.time())),
                "protocol_digest": "",
                "schema_digest": "",
                "payload": json.dumps(message_data)
            }
            
            print(f"Sending to agent: {json.dumps(payload, indent=2)}")
            
            response = requests.post(AGENT_URL, json=payload, timeout=30)
            
            if response.status_code == 200:
                return {"success": True, "data": response.json()}
            else:
                return {"success": False, "error": f"Agent returned status {response.status_code}"}
                
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Agent request timed out"}
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": f"Network error: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

bridge = AgentBridge()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "bridge_port": BRIDGE_PORT,
        "agent_url": AGENT_URL,
        "timestamp": int(time.time())
    })

@app.route('/learn', methods=['POST'])
def learn():
    """Handle learning requests from frontend"""
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({"error": "Missing topic in request"}), 400
        
        # Prepare learning request for agent
        learning_request = {
            "topic": data.get("topic", ""),
            "user_level": data.get("user_level", "Beginner"),
            "learning_style": data.get("learning_style", "Visual")
        }
        
        print(f"Processing learning request: {learning_request}")
        
        # For now, return a mock response since agent communication is complex
        # In production, you would use the agent bridge
        mock_response = {
            "explanation": f"Here's what you need to know about {learning_request['topic']}. This is tailored for {learning_request['user_level']} level learners with a {learning_request['learning_style']} learning style.",
            "key_points": [
                f"Understanding the fundamentals of {learning_request['topic']}",
                f"Key concepts and principles in {learning_request['topic']}",
                f"Practical applications of {learning_request['topic']}",
                f"Best practices for {learning_request['topic']}"
            ],
            "next_steps": [
                f"Practice with {learning_request['topic']} examples",
                f"Join a community focused on {learning_request['topic']}",
                f"Build a project using {learning_request['topic']}"
            ],
            "resources": [
                f"Official {learning_request['topic']} documentation",
                f"Online courses about {learning_request['topic']}",
                f"Books and tutorials on {learning_request['topic']}"
            ]
        }
        
        return jsonify({
            "success": True,
            "data": mock_response
        })
        
    except Exception as e:
        print(f"Error in learn endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/quiz', methods=['POST'])
def generate_quiz():
    """Handle quiz generation requests from frontend"""
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({"error": "Missing topic in request"}), 400
        
        # Prepare quiz request for agent
        quiz_request = {
            "topic": data.get("topic", ""),
            "difficulty": data.get("difficulty", "medium"),
            "num_questions": data.get("num_questions", 5)
        }
        
        print(f"Processing quiz request: {quiz_request}")
        
        # Mock quiz response
        mock_questions = []
        topic = quiz_request['topic']
        
        if "blockchain" in topic.lower():
            mock_questions = [
                {
                    "question": "What is a blockchain?",
                    "options": ["A type of database", "A distributed ledger", "A cryptocurrency", "A programming language"],
                    "correct": 1,
                    "explanation": "A blockchain is a distributed ledger that maintains a continuously growing list of records."
                },
                {
                    "question": "What provides security in blockchain?",
                    "options": ["Passwords", "Cryptography", "Firewalls", "Antivirus"],
                    "correct": 1,
                    "explanation": "Blockchain uses cryptographic hashing and digital signatures for security."
                }
            ]
        elif "ai" in topic.lower():
            mock_questions = [
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
            mock_questions = [
                {
                    "question": f"What is the main concept behind {topic}?",
                    "options": [f"Basic principle of {topic}", f"Advanced concept in {topic}", f"Application of {topic}", f"History of {topic}"],
                    "correct": 0,
                    "explanation": f"This relates to the fundamental principles of {topic}."
                }
            ]
        
        # Limit to requested number of questions
        mock_questions = mock_questions[:quiz_request['num_questions']]
        
        mock_response = {
            "questions": mock_questions,
            "topic": topic
        }
        
        return jsonify({
            "success": True,
            "data": mock_response
        })
        
    except Exception as e:
        print(f"Error in quiz endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Handle general chat requests"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Missing message in request"}), 400
        
        message = data.get("message", "")
        
        # Simple response logic
        if any(word in message.lower() for word in ["learn", "teach", "explain"]):
            response = "I'd be happy to help you learn! What topic would you like to explore?"
        elif any(word in message.lower() for word in ["quiz", "test", "questions"]):
            response = "I can generate quizzes on various topics. What subject interests you?"
        elif "hello" in message.lower() or "hi" in message.lower():
            response = "Hello! I'm your AI learning assistant. I can help you learn new topics and create quizzes. What would you like to explore today?"
        else:
            response = f"I understand you're asking about '{message}'. I can help you learn about this topic or create a quiz. Would you like me to explain this concept or generate some practice questions?"
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/agent-status', methods=['GET'])
def agent_status():
    """Check if the AI agent is running"""
    try:
        response = requests.get("http://localhost:8002", timeout=5)
        return jsonify({
            "agent_running": True,
            "agent_response": response.status_code
        })
    except:
        return jsonify({
            "agent_running": False,
            "message": "AI agent is not responding"
        })

if __name__ == '__main__':
    print(f"Starting Bridge Server on port {BRIDGE_PORT}")
    print(f"Connecting to AI Agent at {AGENT_URL}")
    print("Health check available at: http://localhost:8001/health")
    
    app.run(host='0.0.0.0', port=BRIDGE_PORT, debug=True)
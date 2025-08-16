import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { message, type = "chat", ...options } = body

    let systemPrompt = "You are a helpful educational AI assistant specializing in blockchain, cryptocurrency, AI, and programming. Provide clear, engaging explanations appropriate for the user's level."
    let userPrompt = message

    if (type === "learn") {
      const { topic, user_level = "Beginner", learning_style = "Visual" } = options
      systemPrompt = "You are an expert educational AI assistant. Create comprehensive educational content that is engaging and appropriate for different learning levels and styles."
      userPrompt = `Create educational content about "${topic}" for a ${user_level} level learner with a ${learning_style} learning preference.

Please provide:
1. A clear, engaging explanation of the topic
2. 4-5 key learning points
3. 3-4 practical next steps for continued learning
4. 2-3 real-world examples or applications

Make the content appropriate for ${user_level} level and consider ${learning_style} learning preferences. Include emojis and make it engaging!`
    } else if (type === "quiz") {
      const { topic, difficulty = "medium", num_questions = 3 } = options
      systemPrompt = "You are an expert educational AI assistant. Create engaging quiz questions that test understanding and include real-world context."
      userPrompt = `Create a ${difficulty} difficulty quiz about "${topic}" with exactly ${num_questions} multiple choice questions.

For each question, provide:
- The question text
- 4 answer options (A, B, C, D)
- The correct answer
- An explanation of why the answer is correct
- A brief real-world application or example

Make the questions practical and relevant to real-world applications of ${topic}. Format it nicely with emojis and clear structure!`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API Error:', response.status, errorData)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.content[0].text

    return NextResponse.json({
      success: true,
      response: content,
      type
    })

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
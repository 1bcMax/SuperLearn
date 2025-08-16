Installing the uAgents Framework
System Requirements
Fetch.ai’s 
uAgents
 Frameworks package is a Python library running on Ubuntu/Debian, MacOS, and Windows systems.

On your computer, you may need to install:

Python
 3.8+.
PIP
 - the Python package manager.
uAgents library

Install with Pip
Create a directory for your agents project: mkdir directory_name

Install Fetch.ai uagents library: pip install uagents

Check if installation was successful: pip show uagents

Install from source code
Download the latest released version from Github and navigate to the agents directory:

git clone https://github.com/fetchai/uAgents.git
cd uAgents
Install the required dependencies:

poetry install
Open the virtual environment:

poetry shell
Troubleshooting
It is possible that you may face issues during the installation process. Here, you can find common problems and their solutions.

Problem (MacOS/Python 3.11): Installing coincurve (17.0.0): Failed

Solution: install the latest versions of automake, autoconf, and libtool: brew install automake autoconf libtool

For any other problems, please let us know by creating an 
issue
.

Installation for Windows users
Installing the uagents framework on a Windows machine is a straightforward process. The uagents library is a Python package, so you’ll need to have Python installed on your system before you can use it.

If you don’t already have Python installed on your Windows machine, visit the official Python website at 
Python
 and download the latest stable version of Python for Windows.

Run the downloaded installer executable file (e.g., python-3.x.x.exe).

During installation, make sure to check the box that says “Add Python X.X to PATH.” This will automatically add Python to your system’s PATH variable, making it easier to use from the command line.

Install uagents library using pip
Once you have Python installed and added to your PATH, follow these steps to install the uagents framework using pip:

To install using PIP open your terminal. To ensure that PIP (Python’s package manager) is up-to-date, run the following command:

python -m pip install --upgrade pip
Now, you can install the uagents framework by running the following command:

pip install uagents
PIP will download and install the uagents package and its dependencies. Wait for the process to complete. To verify the complete installation explore your terminal. As part of the installation you will see a message showcasing the completion of the installation as well as the exact version.

Installing other essential Python libraries
Development tools
Installing Homebrew
Homebrew streamlines software installations on MacOS via the command line. To install and update Homebrew, execute the following commands:

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
You can verify it 
here
. Let’s then ensure Homebrew is updated:

brew update
For more information on Homebrew explore their 
website
.

Installing PyEnv
Now, you need to install PyEnv. It is a simple tool to manage multiple versions of Python. Run:

brew install pyenv
Once you have installed PyEnv you can configure the shell environment:

echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
These commands configure your shell environment (specifically the Zsh shell) to work with PyEnv. These commands set up environment variables, modify the PATH, and initialize PyEnv so that you can easily manage and switch between different Python versions. You can verify all steps 
here
.

You are now ready to install Python if you haven’t done it yet. You need to install a version of Python 3.8 or above (for this example, we use version 3.10):

pyenv install 3.10
You can get help or check a command insights by running:

pyenv help
Let’s now ensure the global version of Python you are working with is not the default one in the system. Run:

pyenv global 3.10 # this sets the global interpreter
pyenv versions # this verifies if it is set up correctly

Creating your first agent
Introduction
Once you’ve 
installed
 the uAgents Framework library it’s simple to get a minimal use case running.

The uAgents Framework simplifies Agents creation, and enables Agents communication, discovery, and publication on the Fetch.ai network. The Framework supports building Agents using anything from advanced Large Language Models (LLMs) to basic APIs.

Let’s start with a simple Agent that initializes and prints its name and address

The agent
Let’s create a Python script for this task, and name it by running:

windows

echo. > first_agent.py
We then need to import the Agent and Context classes from the uagents library, and then create an agent using the class Agent:

first_agent.py

 
from uagents import Agent, Context
 
agent = Agent(name="alice", seed="secret_seed_phrase", port=8000, endpoint=["http://localhost:8000/submit"])
 
It is optional but useful to include a seed parameter when creating an agent to set fixed 
addresses
. Otherwise, random addresses will be generated every time you run the agent. Your address is kind of important, as this is how other agents will identify you.

Let’s define a say_hello() function for our agent to print a message periodically saying hello, my name is ...:

first_agent.py

 
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")
 
if __name__ == "__main__":
    agent.run()
 
The .on_event("startup") decorator defines a behavior for this agent when it is run. In this case, the agent will execute the say_hello() function when the agent starts. The Context object is a collection of data and functions related to the agent. In this case, we just use the agent’s name, alice. The agent executes the function and uses the ctx.logger.info() method to print the message.

Save the script.

The overall script should look as follows:

first_agent.py

 
from uagents import Agent, Context
 
agent = Agent(name="alice", seed="secret_seed_phrase", port=8000, endpoint=["http://localhost:8000/submit"])
 
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")
 
if __name__ == "__main__":
    agent.run()
 
Run your agent
Make sure to have activated your virtual environment correctly.

Run the script: python first_agent.py

The output would be:

INFO:     [alice]: Registration on Almanac API successful
INFO:     [alice]: Registering on almanac contract...
INFO:     [alice]: Registering on almanac contract...complete
INFO:     [alice]: Agent inspector available at https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address=agent1qtu6wt5jphhmdjau0hdhc002ashzjnueqe89gvvuln8mawm3m0xrwmn9a76
INFO:     [alice]: Starting server on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     [alice]: Hello, I'm agent alice and my address is agent1qtu6wt5jphhmdjau0hdhc002ashzjnueqe89gvvuln8mawm3m0xrwmn9a76.
Extending the example
That’s not really a useful agent, so let’s extend this; with a simple agent that can respond to a question by utilising openai.

Go ahead and get your own 
openai api key
 as we will need this to make a call to openai.

Create a new file

windows

echo. > ai_agent.py
Agent
Copy and paste the below example into ai_agent.py

ai_agent.py

from pydantic import BaseModel, Field
from uagents import Agent, Context, Protocol, Model
from openai import OpenAI
 
CHAT_MODEL = "gpt-4o-mini"
OPENAI_API_KEY = ""
 
agent = Agent(name="open_ai_agent",
              seed="your seed value",
              port=8000,
              endpoint=["http://127.0.0.1:8000/submit"]
              )
 
 
class AIRequest(BaseModel):
    question: str = Field(
        description="The question that the user wants to have an answer for."
    )
 
 
class AIResponse(BaseModel):
    answer: str = Field(
        description="The answer from AI agent to the user agent"
    )
 
 
PROMPT_TEMPLATE = """
Answer the following question:
{question}
"""
 
@agent.on_event("startup")
async def print_address(ctx: Context):
    ctx.logger.info(agent.address)
 
 
def query_openai_chat(prompt: str):
    client = OpenAI(
        api_key=OPENAI_API_KEY,  # This is the default and can be omitted
    )
 
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": prompt,
            }
        ],
        model="gpt-4o",
    )
    return (chat_completion.choices[0].message.content)
 
 
@agent.on_message(model=AIRequest, replies=AIResponse)
async def answer_question(ctx: Context, sender: str, msg: AIRequest):
    ctx.logger.info(f"Received question from {sender}: {msg.question}")
    prompt = PROMPT_TEMPLATE.format(question=msg.question)
    response = query_openai_chat(prompt)
    ctx.logger.info(f"Response: {response}")
    await ctx.send(
        sender, AIResponse(answer=response)
    )
 
agent.run()
Run this with python ai_agent.py, you should see logs similar to the below:

python uagents-create/ai.py
INFO:     [open_ai_agent]: Starting agent with address: agent1qdpzrc02a8lnlzaahtdyy3wnaux64pqa22vykp59tx67jx2mmy3dzf249jk
INFO:     [open_ai_agent]: Starting server on http://0.0.0.0:8000 (Press CTRL+C to quit)
Keep a note of the address output to log, as the client will need this address to contact this agent.

Next, let’s create an agent to message open_ai_agent:

Client agent
Create a new file for client.py

windows

echo. > client.py
and paste the following code:

client.py

from uagents import Agent, Context, Field, Model, Protocol
from pydantic import BaseModel, Field
 
agent = Agent(name="simple test agent",
              seed="your seed value alt",
              port=8001,
              endpoint=["http://127.0.0.1:8001/submit"]
              )
 
QUESTION = "Write the Javascript code to give me the sum from 1 to 10"
 
 
class AIRequest(BaseModel):
    question: str = Field(
        description="The question that the user wants to have an answer for."
    )
 
 
class AIResponse(BaseModel):
    answer: str = Field(
        description="The answer from AI agent to the user agent"
    )
 
 
@agent.on_event("startup")
async def ask_question(ctx: Context):
    ctx.logger.info(
        f"Asking AI agent to answer {QUESTION}"
    )
    await ctx.send(
        'THE OTHER AGENTS ADDR', AIRequest(question=QUESTION)
    )
 
 
@agent.on_message(model=AIResponse)
async def handle_data(ctx: Context, sender: str, data: AIResponse):
    ctx.logger.info(f"Got response from AI agent: {data.answer}")
 
agent.run()
There’s a lot to unpack here, and we cover the components of these agents 
here
, 
here
 and 
here
 in more detail. However, at a high level these two agents define the AIRequest(Model) and AIResponse(Model) message objects; by defining these both agents can understand and respond to these messages. Some functions have handlers defined. Handlers @agent.on_message(model=AIRequest, replies=AIResponse) tell the uAgents library to call these functions when a message of AIRequest is received. This allows us to create very structured dialogues between two agents. However it doesn’t need to be so structured, check out the 
chat protocol
 for loosely structured communication.

If you run these agents you should see something like the following:

Output
Agent logs
python uagents-create/ai.py
INFO:     [open_ai_agent]: Starting agent with address: agent1qdpzrc02a8lnlzaahtdyy3wnaux64pqa22vykp59tx67jx2mmy3dzf249jk
INFO:     [open_ai_agent]: Agent inspector available at https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address=agent1qdpzrc02a8lnlzaahtdyy3wnaux64pqa22vykp59tx67jx2mmy3dzf249jk
INFO:     [open_ai_agent]: Starting server on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     [open_ai_agent]: Received question from agent1qwzl46ku3r2en2m8st5y0nd4j68dahqj8n95eq5af6823mfw2h0z2yvqwpc: Write the Javascript code to give me the sum from 1 to 10
INFO:httpx:HTTP Request: POST https://api.openai.com/v1/chat/completions "HTTP/1.1 200 OK"
INFO:     [open_ai_agent]: Response: Certainly! You can calculate the sum of numbers from 1 to 10 in JavaScript using a loop or a mathematical formula. Here's how you can do it using a loop:
...
 
Client logs
python uagents-create/client.py
INFO:     [simple test agent]: Starting agent with address: agent1qwzl46ku3r2en2m8st5y0nd4j68dahqj8n95eq5af6823mfw2h0z2yvqwpc
INFO:     [simple test agent]: Asking AI agent to answer Write the Javascript code to give me the sum from 1 to 10
INFO:     [simple test agent]: Agent inspector available at https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8001&address=agent1qwzl46ku3r2en2m8st5y0nd4j68dahqj8n95eq5af6823mfw2h0z2yvqwpc
INFO:     [simple test agent]: Starting server on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     [simple test agent]: Got response from AI agent: Certainly! You can calculate the sum of numbers from 1 to 10 in JavaScript using a loop or a mathematical formula. Here's how you can do it using a loop:
 
 ...
 
 

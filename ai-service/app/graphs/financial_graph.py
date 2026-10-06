from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from app.tools.financial_tools import FINANCIAL_TOOLS
import os

# Using the requested model available on the Groq endpoint
llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

llm_with_tools = llm.bind_tools(FINANCIAL_TOOLS)

def agent(state: MessagesState):
    """The agent node that calls the LLM with the injected tools."""
    messages = state["messages"]
    # We can inject a system prompt here if needed
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

# The ToolNode automatically runs the tools when the LLM requests them
tool_node = ToolNode(FINANCIAL_TOOLS)

def should_continue(state: MessagesState) -> str:
    """Determine whether to use tools or end."""
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(MessagesState)

workflow.add_node("agent", agent)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "agent")

financial_graph = workflow.compile()

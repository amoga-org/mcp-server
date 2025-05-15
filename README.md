# MCP Server for Claude Desktop

This MCP server allows you to interact with the Amoga Studio API through Claude Desktop.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

## Using with Claude Desktop

Add this server to your Claude Desktop configuration by adding the following to your Claude configuration:

```json
{
  "mcpServers": {
   "appstudio": {
      "command": "node",
      "args": [
        "/Users/shubhamyadav/Desktop/mcp-server/build/index.js"
      ],
      "env": {
        "MCP_API_KEY": "Add API Key"
      }
    }
}
}
```

Replace the following values:
- `MCP_API_KEY`: Your Amoga Studio API key
- `/path/to/mcp-server`: The absolute path to this MCP server directory

## Available Features

The server provides the following capabilities:

- Create applications
- Get all applications
- Delete applications
- Get app contracts
- Create objects with attributes, statuses, and relationships
- Create Status Origination Trees (SOT)

## Example Usage

Once configured, you can interact with the server through Claude Desktop. For example:

"Create a new application called 'My App'"
"List all applications"
"Create an object with status and attributes"

The server will handle authentication automatically using the provided configuration.
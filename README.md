# MCP Server for Claude Desktop

This MCP server allows you to interact with the Amoga Studio API through Claude Desktop.

## Quick Setup (No Clone Required)

Add this server to your Claude Desktop configuration by adding one of the following configurations:

### Using npx:

```json
{
  "mcpServers": {
    "appstudio": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-amogastudio"
      ],
      "env": {
        "MCP_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Using uvx:

```json
{
  "mcpServers": {
    "appstudio": {
      "command": "uvx",
      "args": [
        "mcp-server-amogastudio"
      ],
      "env": {
        "MCP_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Replace `YOUR_API_KEY` with your Amoga Studio API key.

## Manual Setup (For Development)

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

## Using with Claude Desktop

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

The server will handle authentication automatically using the provided API key.

## Configuration Options

The server accepts the following environment variables:

- `MCP_API_KEY` (required): Your Amoga Studio API key
- `BASE_URL` (optional): The base URL of your Amoga Studio instance
- `TENANT_NAME` (optional): Your tenant name (can be specified per command)
# Amoga Studio MCP Server

**MCP Server for Amoga Studio integration with Claude Desktop**

A powerful Model Context Protocol (MCP) server that enables seamless integration between Claude Desktop and Amoga Studio's low-code application development platform. This server provides comprehensive tools for creating, managing, and deploying applications with advanced features like RBAC, automation, and AI-powered code generation.

## Quick Setup (No Clone Required)

Add this server to your Claude Desktop configuration by adding one of the following configurations:

### Using npx (Recommended):

```json
{
  "mcpServers": {
    "amogastudio": {
      "command": "npx",
      "args": ["-y", "amogastudio"],
      "env": {
        "AMOGA_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Using uvx:

```json
{
  "mcpServers": {
    "amogastudio": {
      "command": "uvx",
      "args": ["amogastudio"],
      "env": {
        "AMOGA_API_KEY": "YOUR_API_KEY"
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

## Features & Capabilities

### 🚀 **Application Management**

- Create, read, update, and delete applications
- Get application contracts and configurations
- Publish applications with status tracking

### 🏗️ **Object & Data Modeling**

- Create objects with attributes, statuses, and relationships
- Support for various data types (text, number, date, boolean, enumeration)
- Advanced relationship modeling (oneToMany, manyToOne)

### 🔐 **Advanced RBAC (Role-Based Access Control)**

- **createRoleV1**: AI-powered role creation with contract-aware permission mapping
- Intelligent object matching with fuzzy logic
- Granular permissions per role and object
- Automatic default permission assignment

### 🤖 **AI-Powered Automation**

- **createAutomationV1**: Natural language automation generation
- Contract-aware script generation with Python code
- Email templates and PDF generation
- Complete workflow automation with trigger details

### 📊 **Status Origination Trees (SOT)**

- Define status transitions and origination sources
- Page layout generation with widget management
- Workflow integration and automation triggers

### 🎨 **UI & Navigation**

- Create navigation bars and page structures
- Generate application pages with custom widgets
- Support for dashboard and record page layouts

### 👥 **User & Access Management**

- Job title creation and management
- User creation with role assignments
- Attribute management for data structures

## Using with Claude Desktop

The server provides two tool categories:

### **Legacy Tools** (Backward Compatibility)

- `create-app`, `get-apps`, `delete-app`
- `create-object`, `create-sot`, `delete-object`
- `create-update-roles`, `create-attributes`
- `add-dummy-data`, `publish-app`, `check-publish-status`

### **V1 Tools** (Modern & AI-Enhanced)

- **`createAppV1`**: Streamlined application creation
- **`createSOTV1`**: Objects with attributes and SOT processing
- **`createRoleV1`**: Advanced RBAC with intelligent permission mapping
- **`createAutomationV1`**: AI-powered automation generation
- **`publishV1`**: Simple application publishing

## Example Usage

Once configured, you can interact with the server through Claude Desktop with natural language:

### **Application Management**

- "Create a new application called 'Inventory Management System'"
- "Show me all my applications"
- "Get the contract details for app ID 12345"

### **RBAC Setup**

- "Create roles for my app: Admin with full access, User with read-only access to products"
- "Set up RBAC permissions where Manager can create and update orders but cannot delete them"

### **AI Automation**

- "When a new order is created, send email to the customer and create a follow-up task"
- "Create automation that generates PDF invoice when order status changes to completed"

### **Object Creation**

- "Create a Product object with name, price, category, and stock quantity fields"
- "Add status workflow to Task object: Todo → In Progress → Completed"

The server handles authentication automatically using the provided API key and provides intelligent suggestions based on your application contract.

## Dependencies & Requirements

This package requires the following dependencies:

```json
{
  "@modelcontextprotocol/sdk": "^1.11.1",
  "axios": "^1.10.0",
  "dotenv": "^16.5.0",
  "uuid": "^11.1.0",
  "zod": "^3.24.4"
}
```

**Development dependencies:**

- TypeScript 5.8.3+
- Node.js 18+
- Cross-platform environment support

## Configuration Options

The server accepts the following environment variables:

- **`AMOGA_API_KEY`** (required): Your Amoga Studio API key
- **`BASE_URL`** (optional): The base URL of your Amoga Studio instance
- **`TENANT_NAME`** (optional): Your tenant name (can be specified per command)
- **`NODE_ENV`** (optional): Environment mode (development/production)

## Repository Information

- **Package Name**: `amogastudio`
- **Version**: 1.0.0
- **Repository**: [https://github.com/amoga-org/mcp-server](https://github.com/amoga-org/mcp-server)
- **License**: ISC
- **Keywords**: MCP, Amoga Studio, Claude, Copilot, Low-code, Automation

## Build & Development

### Build the project:

```bash
npm run build
```

### Development setup:

```bash
git clone https://github.com/amoga-org/mcp-server.git
cd mcp-server
npm install
npm run build
```

The build process compiles TypeScript to JavaScript and places the output in the `build/` directory.

## Support & Issues

- **Issues**: [GitHub Issues](https://github.com/amoga-org/mcp-server/issues)
- **Homepage**: [GitHub Repository](https://github.com/amoga-org/mcp-server#readme)

## Contributing

This project is part of the Amoga Studio ecosystem. For contributions and development guidelines, please refer to the repository documentation.

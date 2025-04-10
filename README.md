# mcp-mssql

This MCP server allows you to execute SQL queries against a Microsoft SQL Server database. It only allows SELECT queries.

## Setup

To use this server, you need to set the following environment variables:

*   `MSSQL_SERVER`: The server address (default: `localhost`)
*   `MSSQL_PORT`: The server port (default: `1433`)
*   `MSSQL_USER`: The username to connect to the database (default: `sa`)
*   `MSSQL_PASSWORD`: The password to connect to the database (default: `your_password`)
*   `MSSQL_DATABASE`: The database to connect to (default: `your_database`)

You also need to add the MCP server configuration to the settings file located at 'c:\Users\Sajid\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json'. The settings file may have other MCP servers already configured, so you would read it first and then add your new server to the existing `mcpServers` object.

```json
{
  "mcpServers": {
    "mcp-mssql": {
      "command": "node",
      "args": ["/path/to/mcp-mssql/build/index.js"],
      "env": {
        "MSSQL_SERVER": "localhost",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "your_password",
        "MSSQL_DATABASE": "your_database"
      }
    }
  }
}
```

(Note: the user may also ask you to install the MCP server to the Claude desktop app, in which case you would read then modify `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS for example. It follows the same format of a top level `mcpServers` object.)

## Usage

To use the server, you can call the `execute_query` tool with a SQL query as input. For example:

```json
{
  "server_name": "mcp-mssql",
  "tool_name": "execute_query",
  "arguments": {
    "query": "SELECT * FROM your_table"
  }
}

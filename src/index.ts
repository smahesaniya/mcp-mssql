#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'your_password',
  database: process.env.MSSQL_DATABASE || 'your_database',
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to false for production
  },
};

class MSSQLServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-mssql',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_query',
          description: 'Execute a SQL query',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'SQL query to execute',
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'execute_query') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const query = request.params.arguments?.query;

      if (!query) {
        throw new McpError(ErrorCode.InvalidParams, 'Query is required');
      }

      try {
        if (!(typeof query === 'string') || !query.trim().toUpperCase().startsWith('SELECT')) {
          throw new Error('Only SELECT queries are allowed');
        }
        const pool = await sql.connect(config);
        const result = await sql.query(query);
        pool.close();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.recordset, null, 2),
            },
          ],
        };
      } catch (err: any) {
        console.error('SQL error', err);
        return {
          content: [
            {
              type: 'text',
              text: `SQL error: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MSSQL MCP server running on stdio');
  }
}

const server = new MSSQLServer();
server.run().catch(console.error);

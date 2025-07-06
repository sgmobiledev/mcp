import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";

const server = new McpServer( {
    name: "weather-mcp-server",
    version: '1.0.0',
});

server.tool(
    'get-weather',
    'Tool to the weather for a city',
    { 
        city: z.string().describe('The name of the city to get the weather for'), 
    },
    async( { city }) => {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=de&format=json`);  
      const data = await response.json();
      if (data.results.length === 0) {
        return {
            content: [
                {
                type: 'text',
                text: `No results found for city: ${city}`,
                }
            ]
            }
        }
        const { latitude, longitude } = data.results[0];
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,rain,cloud_cover,showers`);
        const weatherData = await weatherResponse.json();
        
        return {
        content: [
            {
            type: 'text',
            text:  JSON.stringify(weatherData, null, 2),
            }
        ]
      }  
    }    
);

const transport = new StdioServerTransport();
server.connect(transport);

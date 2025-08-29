import { CreatePagesV1Params } from "../schemas/pages-v1-schema.js";
import { createPagesV1 } from "../services/pages-v1.service.js";

/**
 * Handler for creating pages with widgets in V1 architecture
 */
export async function createPagesV1Handler(params: CreatePagesV1Params) {
  try {
    const result = await createPagesV1(params);
    
    if (result.success) {
      let responseText = `✅ **Pages Created Successfully**\n\n`;
      responseText += `📊 **Summary:**\n`;
      responseText += `• Total Requested: ${result.totalRequested}\n`;
      responseText += `• Successfully Created: ${result.totalCreated}\n`;
      responseText += `• Failed: ${result.errors.length}\n\n`;
      
      if (result.createdPages.length > 0) {
        responseText += `📄 **Created Pages:**\n`;
        result.createdPages.forEach((page: any) => {
          responseText += `\n**${page.name}**\n`;
          responseText += `  • Page ID: ${page.pageId}\n`;
          responseText += `  • Type: ${page.type}\n`;
          responseText += `  • Widgets: ${page.widgetCount}\n`;
          responseText += `  • Role: ${page.role}\n`;
        });
      }
      
      if (result.errors.length > 0) {
        responseText += `\n⚠️ **Errors:**\n`;
        result.errors.forEach((error: any) => {
          responseText += `• ${error.page}: ${error.error}\n`;
        });
      }
      
      responseText += `\n🎯 **Features Implemented:**\n`;
      responseText += `• Smart widget positioning with AI layout optimization\n`;
      responseText += `• Automatic grid calculation to prevent overlap\n`;
      responseText += `• Role-based page access configuration\n`;
      responseText += `• Support for index (list) and record (detail) page types\n`;
      responseText += `• Pre-configured widget properties and styling\n`;
      
      return {
        content: [
          {
            type: "text" as const,
            text: responseText,
          },
        ],
      };
    } else {
      let errorText = `❌ **Failed to create pages**\n\n`;
      errorText += `**Error Details:**\n`;
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: any) => {
          if (error.page) {
            errorText += `• Page "${error.page}": ${error.error}\n`;
          } else {
            errorText += `• ${error.error}\n`;
          }
        });
      } else {
        errorText += result.message;
      }
      
      return {
        content: [
          {
            type: "text" as const,
            text: errorText,
          },
        ],
      };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ **Error creating pages:** ${error.message || error}`,
        },
      ],
    };
  }
}
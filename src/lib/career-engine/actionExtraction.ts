export interface ActionItem {
  description: string;
  dueDays: number;
}

/**
 * Extracts action items from the AI response.
 * Expects the AI to output tasks in the format:
 * [ACTION: Description of the task | DUE: X days]
 */
export function extractActionItems(aiResponse: string): { cleanedResponse: string; actionItems: ActionItem[] } {
  const actionItems: ActionItem[] = [];
  
  // Regex to match [ACTION: ... | DUE: ... days]
  const regex = /\[ACTION:\s*(.*?)\s*\|\s*DUE:\s*(\d+)\s*days?\]/gi;
  
  let cleanedResponse = aiResponse;
  let match;
  
  while ((match = regex.exec(aiResponse)) !== null) {
    actionItems.push({
      description: match[1].trim(),
      dueDays: parseInt(match[2], 10) || 3 // Default to 3 days if unparseable
    });
  }
  
  // Strip the action tags from the final response shown to the user
  cleanedResponse = cleanedResponse.replace(regex, '').trim();
  
  return { cleanedResponse, actionItems };
}
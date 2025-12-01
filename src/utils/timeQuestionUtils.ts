/**
 * Utility functions for detecting and handling time-related questions
 */

/**
 * Check if a question is about time based on Thai keywords
 */
export const isTimeQuestion = (questionText: string): boolean => {
  return /นาฬิกา|เวลา|ชี้.*นาที|บอกเวลา/i.test(questionText);
};

/**
 * Extract time from Thai format "X นาฬิกา Y นาที"
 * Returns hour and minute as numbers, or null if pattern not found
 */
export const extractTimeFromThaiFormat = (text: string): { hour: number; minute: number } | null => {
  const thaiTimePattern = /(\d{1,2})\s*นาฬิกา\s*(\d{1,2})?\s*นาที/i;
  const match = String(text).match(thaiTimePattern);
  
  if (match) {
    return {
      hour: parseInt(match[1], 10),
      minute: match[2] ? parseInt(match[2], 10) : 0
    };
  }
  
  return null;
};

// Query Parser class to convert natural language to filters
class QueryParser {
    // Parse natural language query and return filter object
    static parseQuery(query) {
      if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
      }
  
      const filters = {};
      const lowerQuery = query.toLowerCase().trim();
      const parsedFilters = {};
  
      // ============================================
      // Check for palindrome requirement
      // ============================================
      if (
        lowerQuery.includes('palindrom') ||
        lowerQuery.includes('palindrome')
      ) {
        parsedFilters.is_palindrome = true;
      }
  
      // ============================================
      // Check for word count requirements
      // ============================================
      
      // "single word" or "one word"
      if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
        parsedFilters.word_count = 1;
      }
      
      // "two word" or "two words"
      if (lowerQuery.includes('two word')) {
        parsedFilters.word_count = 2;
      }
      
      // "three word" or "three words"
      if (lowerQuery.includes('three word')) {
        parsedFilters.word_count = 3;
      }
      
      // "exactly N word" pattern
      const exactlyMatch = lowerQuery.match(/exactly\s+(\d+)\s+words?/);
      if (exactlyMatch) {
        parsedFilters.word_count = parseInt(exactlyMatch[1]);
      }
  
      // ============================================
      // Check for length requirements
      // ============================================
      
      // "longer than N characters"
      const longerMatch = lowerQuery.match(/longer\s+than\s+(\d+)\s+characters?/);
      if (longerMatch) {
        parsedFilters.min_length = parseInt(longerMatch[1]) + 1;
      }
      
      // "shorter than N characters"
      const shorterMatch = lowerQuery.match(/shorter\s+than\s+(\d+)\s+characters?/);
      if (shorterMatch) {
        parsedFilters.max_length = parseInt(shorterMatch[1]) - 1;
      }
      
      // "at least N characters"
      const atLeastMatch = lowerQuery.match(/at\s+least\s+(\d+)\s+characters?/);
      if (atLeastMatch) {
        parsedFilters.min_length = parseInt(atLeastMatch[1]);
      }
      
      // "at most N characters"
      const atMostMatch = lowerQuery.match(/at\s+most\s+(\d+)\s+characters?/);
      if (atMostMatch) {
        parsedFilters.max_length = parseInt(atMostMatch[1]);
      }
      
      // "exactly N characters" or "N chars"
      const exactLengthMatch = lowerQuery.match(/exactly\s+(\d+)\s+characters?|(\d+)\s+chars/);
      if (exactLengthMatch) {
        const length = parseInt(exactLengthMatch[1] || exactLengthMatch[2]);
        parsedFilters.min_length = length;
        parsedFilters.max_length = length;
      }
  
      // ============================================
      // Check for character/letter requirements
      // ============================================
      
      // "contains the letter X" or "contains X"
      const containsLetterMatch = lowerQuery.match(/contains?\s+(?:the\s+)?(?:letter\s+)?([a-z])/);
      if (containsLetterMatch) {
        parsedFilters.contains_character = containsLetterMatch[1];
      }
      
      // "the first vowel" = 'a'
      if (lowerQuery.includes('first vowel')) {
        parsedFilters.contains_character = 'a';
      }
      
      // "the letter X"
      const theLetterMatch = lowerQuery.match(/the\s+letter\s+([a-z])/);
      if (theLetterMatch) {
        parsedFilters.contains_character = theLetterMatch[1];
      }
  
      // ============================================
      // Validate and return parsed filters
      // ============================================
      
      if (Object.keys(parsedFilters).length === 0) {
        throw new Error('Could not parse any filters from the query');
      }
  
      // Validate conflicting filters
      if (
        parsedFilters.min_length &&
        parsedFilters.max_length &&
        parsedFilters.min_length > parsedFilters.max_length
      ) {
        throw new Error(
          'Conflicting filters: min_length cannot be greater than max_length'
        );
      }
  
      return {
        query: query,
        parsed_filters: parsedFilters
      };
    }
  
    // Get interpretation of the query (for response)
    static getQueryInterpretation(query, parsedFilters) {
      return {
        original: query,
        parsed_filters: parsedFilters
      };
    }
  }
  
  module.exports = QueryParser;

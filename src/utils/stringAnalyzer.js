const crypto = require('crypto');

// String Analyzer class with static methods
class StringAnalyzer {
  // Compute length of string
  static getLength(str) {
    return str.length;
  }

  // Check if string is palindrome (case-insensitive)
  static isPalindrome(str) {
    // Convert to lowercase and remove spaces for palindrome check
    const cleaned = str.toLowerCase().replace(/\s+/g, '');
    
    // Check if it reads the same forwards and backwards
    return cleaned === cleaned.split('').reverse().join('');
  }

  // Count unique/distinct characters
  static getUniqueCharacterCount(str) {
    // Convert to set to get unique characters
    const uniqueChars = new Set(str);
    return uniqueChars.size;
  }

  // Count words (separated by whitespace)
  static getWordCount(str) {
    // Trim and split by whitespace
    const words = str.trim().split(/\s+/);
    
    // Filter out empty strings
    return words.filter(word => word.length > 0).length;
  }

  // Generate SHA256 hash of string
  static generateSHA256(str) {
    return crypto
      .createHash('sha256')
      .update(str)
      .digest('hex');
  }

  // Create character frequency map
  static getCharacterFrequencyMap(str) {
    const frequencyMap = {};

    // Iterate through each character
    for (const char of str) {
      // If character exists, increment count
      if (frequencyMap[char]) {
        frequencyMap[char]++;
      } else {
        // Otherwise, initialize to 1
        frequencyMap[char] = 1;
      }
    }

    return frequencyMap;
  }

  // Analyze complete string and return all properties
  static analyzeString(str) {
    // Validate input is string
    if (typeof str !== 'string') {
      throw new Error('Input must be a string');
    }

    // Calculate all properties
    const length = this.getLength(str);
    const is_palindrome = this.isPalindrome(str);
    const unique_characters = this.getUniqueCharacterCount(str);
    const word_count = this.getWordCount(str);
    const sha256_hash = this.generateSHA256(str);
    const character_frequency_map = this.getCharacterFrequencyMap(str);

    // Return properties object
    return {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map
    };
  }
}

module.exports = StringAnalyzer;
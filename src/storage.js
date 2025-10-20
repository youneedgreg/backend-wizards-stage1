// In-memory storage for strings
// Key: SHA256 hash, Value: string object
const stringStorage = {};

// Storage class with methods
class Storage {
  // Add a new string to storage
  static addString(stringObject) {
    stringStorage[stringObject.id] = stringObject;
    return stringObject;
  }

  // Get string by hash (id)
  static getStringByHash(hash) {
    return stringStorage[hash] || null;
  }

  // Get string by value (need to search through all)
  static getStringByValue(value) {
    const hash = Object.keys(stringStorage).find(hash => {
      return stringStorage[hash].value === value;
    });
    return hash ? stringStorage[hash] : null;
  }

  // Get all strings
  static getAllStrings() {
    return Object.values(stringStorage);
  }

  // Check if string exists by value
  static stringExists(value) {
    return Object.values(stringStorage).some(str => str.value === value);
  }

  // Check if string exists by hash
  static hashExists(hash) {
    return stringStorage.hasOwnProperty(hash);
  }

  // Delete string by value
  static deleteStringByValue(value) {
    const hash = Object.keys(stringStorage).find(hash => {
      return stringStorage[hash].value === value;
    });
    
    if (hash) {
      delete stringStorage[hash];
      return true;
    }
    return false;
  }

  // Delete string by hash
  static deleteStringByHash(hash) {
    if (stringStorage.hasOwnProperty(hash)) {
      delete stringStorage[hash];
      return true;
    }
    return false;
  }

  // Get count of stored strings
  static getCount() {
    return Object.keys(stringStorage).length;
  }

  // Clear all storage (useful for testing)
  static clear() {
    for (let key in stringStorage) {
      delete stringStorage[key];
    }
  }

  // Get strings matching multiple criteria
  static filterStrings(criteria) {
    let results = this.getAllStrings();

    // Filter by is_palindrome
    if (criteria.is_palindrome !== undefined) {
      results = results.filter(str => str.properties.is_palindrome === criteria.is_palindrome);
    }

    // Filter by min_length
    if (criteria.min_length !== undefined) {
      results = results.filter(str => str.properties.length >= criteria.min_length);
    }

    // Filter by max_length
    if (criteria.max_length !== undefined) {
      results = results.filter(str => str.properties.length <= criteria.max_length);
    }

    // Filter by word_count
    if (criteria.word_count !== undefined) {
      results = results.filter(str => str.properties.word_count === criteria.word_count);
    }

    // Filter by contains_character
    if (criteria.contains_character !== undefined) {
      const char = criteria.contains_character;
      results = results.filter(str => {
        return str.properties.character_frequency_map[char] !== undefined;
      });
    }

    return results;
  }
}

module.exports = Storage;
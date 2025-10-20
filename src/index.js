const express = require('express');
const StringAnalyzer = require('./utils/stringAnalyzer');
const QueryParser = require('./utils/queryParser');
const Storage = require('./storage');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ENDPOINT 1: POST /strings - Create/Analyze String
// ============================================
app.post('/strings', (req, res) => {
  try {
    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({
        status: 'error',
        message: 'Request body is required'
      });
    }

    // Validate "value" field exists
    if (!req.body.hasOwnProperty('value')) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: "value"'
      });
    }

    const { value } = req.body;

    // Validate "value" is a string
    if (typeof value !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'Field "value" must be a string'
      });
    }

    // Validate "value" is not empty
    if (value.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Field "value" cannot be empty'
      });
    }

    // Check if string already exists
    if (Storage.stringExists(value)) {
      return res.status(409).json({
        status: 'error',
        message: 'String already exists in the system'
      });
    }

    // Analyze the string
    console.log(`Analyzing string: "${value}"`);
    const properties = StringAnalyzer.analyzeString(value);

    // Create string object
    const stringObject = {
      id: properties.sha256_hash,
      value: value,
      properties: properties,
      created_at: new Date().toISOString()
    };

    // Store the string
    Storage.addString(stringObject);
    console.log(`String stored with hash: ${properties.sha256_hash}`);

    // Return 201 Created response
    res.status(201).json(stringObject);

  } catch (error) {
    console.error('POST /strings error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// ENDPOINT 3: GET /strings - Get All with Filters
// ============================================
app.get('/strings', (req, res) => {
  try {
    console.log('Fetching strings with filters:', req.query);

    // Get all strings
    let results = Storage.getAllStrings();

    // Build filter criteria from query parameters
    const filterCriteria = {};

    // Parse is_palindrome filter
    if (req.query.is_palindrome !== undefined) {
      const value = req.query.is_palindrome;
      if (value === 'true') {
        filterCriteria.is_palindrome = true;
      } else if (value === 'false') {
        filterCriteria.is_palindrome = false;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "is_palindrome" must be "true" or "false"'
        });
      }
    }

    // Parse min_length filter
    if (req.query.min_length !== undefined) {
      const value = parseInt(req.query.min_length);
      if (isNaN(value)) {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "min_length" must be an integer'
        });
      }
      filterCriteria.min_length = value;
    }

    // Parse max_length filter
    if (req.query.max_length !== undefined) {
      const value = parseInt(req.query.max_length);
      if (isNaN(value)) {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "max_length" must be an integer'
        });
      }
      filterCriteria.max_length = value;
    }

    // Parse word_count filter
    if (req.query.word_count !== undefined) {
      const value = parseInt(req.query.word_count);
      if (isNaN(value)) {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "word_count" must be an integer'
        });
      }
      filterCriteria.word_count = value;
    }

    // Parse contains_character filter
    if (req.query.contains_character !== undefined) {
      const value = req.query.contains_character;
      if (typeof value !== 'string' || value.length !== 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Query parameter "contains_character" must be a single character'
        });
      }
      filterCriteria.contains_character = value;
    }

    // Apply filters
    if (Object.keys(filterCriteria).length > 0) {
      results = Storage.filterStrings(filterCriteria);
      console.log(`Filters applied, found ${results.length} matching strings`);
    }

    // Build filters_applied object
    const filtersApplied = {};
    if (req.query.is_palindrome !== undefined) {
      filtersApplied.is_palindrome = req.query.is_palindrome === 'true';
    }
    if (req.query.min_length !== undefined) {
      filtersApplied.min_length = parseInt(req.query.min_length);
    }
    if (req.query.max_length !== undefined) {
      filtersApplied.max_length = parseInt(req.query.max_length);
    }
    if (req.query.word_count !== undefined) {
      filtersApplied.word_count = parseInt(req.query.word_count);
    }
    if (req.query.contains_character !== undefined) {
      filtersApplied.contains_character = req.query.contains_character;
    }

    // Return 200 OK response
    res.status(200).json({
      data: results,
      count: results.length,
      filters_applied: Object.keys(filtersApplied).length > 0 ? filtersApplied : null
    });

  } catch (error) {
    console.error('GET /strings error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// ENDPOINT 4: GET /strings/filter-by-natural-language - Natural Language Query
// IMPORTANT: Must come BEFORE GET /strings/:value
// ============================================
app.get('/strings/filter-by-natural-language', (req, res) => {
  try {
    const { query } = req.query;

    // Validate query parameter exists
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "query" is required'
      });
    }

    console.log(`Processing natural language query: "${query}"`);

    // Parse the natural language query
    let parseResult;
    try {
      parseResult = QueryParser.parseQuery(query);
    } catch (parseError) {
      if (parseError.message.includes('Conflicting')) {
        return res.status(422).json({
          status: 'error',
          message: parseError.message
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'Unable to parse natural language query'
      });
    }

    // Get parsed filters
    const parsedFilters = parseResult.parsed_filters;

    // Apply filters to storage
    let results = Storage.filterStrings(parsedFilters);
    console.log(`Query parsed successfully, found ${results.length} matching strings`);

    // Return 200 OK response
    res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters
      }
    });

  } catch (error) {
    console.error('GET /strings/filter-by-natural-language error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// ENDPOINT 2: GET /strings/{string_value} - Get Specific String
// IMPORTANT: Must come AFTER filter-by-natural-language
// ============================================
app.get('/strings/:value', (req, res) => {
  try {
    const { value } = req.params;

    // Decode URI component (handle URL encoding)
    const decodedValue = decodeURIComponent(value);

    console.log(`Retrieving string: "${decodedValue}"`);

    // Check if string exists
    if (!Storage.stringExists(decodedValue)) {
      return res.status(404).json({
        status: 'error',
        message: 'String not found'
      });
    }

    // Get the string
    const stringObject = Storage.getStringByValue(decodedValue);

    // Return 200 OK response
    res.status(200).json(stringObject);

  } catch (error) {
    console.error('GET /strings/:value error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// ENDPOINT 5: DELETE /strings/{string_value} - Delete String
// ============================================
app.delete('/strings/:value', (req, res) => {
  try {
    const { value } = req.params;

    // Decode URI component (handle URL encoding)
    const decodedValue = decodeURIComponent(value);

    console.log(`Deleting string: "${decodedValue}"`);

    // Check if string exists
    if (!Storage.stringExists(decodedValue)) {
      return res.status(404).json({
        status: 'error',
        message: 'String not found'
      });
    }

    // Delete the string
    Storage.deleteStringByValue(decodedValue);
    console.log(`String deleted successfully`);

    // Return 204 No Content response
    res.status(204).send();

  } catch (error) {
    console.error('DELETE /strings/:value error:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// Health Check Endpoint (Optional)
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    strings_stored: Storage.getCount()
  });
});

// ============================================
// Root Endpoint (Optional)
// ============================================
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Backend Wizards Stage 1 API',
    service: 'String Analyzer Service',
    endpoints: {
      'POST /strings': 'Analyze and store a string',
      'GET /strings': 'Get all strings with filters',
      'GET /strings/{value}': 'Get specific string',
      'GET /strings/filter-by-natural-language': 'Query using natural language',
      'DELETE /strings/{value}': 'Delete a string',
      'GET /health': 'Health check'
    }
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🧙 Backend Wizards Stage 1 API 🧙   ║
  ║   String Analyzer Service              ║
  ║   Server running on port ${PORT}       ║
  ║   Local: http://localhost:${PORT}      ║
  ╚════════════════════════════════════════╝
  `);
  console.log('Available endpoints:');
  console.log('  POST   /strings');
  console.log('  GET    /strings');
  console.log('  GET    /strings/filter-by-natural-language');
  console.log('  GET    /strings/:value');
  console.log('  DELETE /strings/:value');
  console.log('  GET    /health');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
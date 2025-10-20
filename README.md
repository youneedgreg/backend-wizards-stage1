# Backend Wizards Stage 1: String Analyzer Service

## 🎯 Project Description

A RESTful API service that analyzes strings and stores their computed properties. The service can compute various string properties, store them persistently, and provide advanced filtering and search capabilities.

## ✨ Features

- **String Analysis:** Compute properties like length, palindrome detection, character frequency, and SHA256 hashing
- **Persistent Storage:** In-memory storage for analyzed strings
- **Advanced Filtering:** Filter strings by multiple criteria
- **Natural Language Queries:** Parse natural language to automatically generate filters
- **Full CRUD Operations:** Create, read, update, and delete strings

## 🚀 Quick Start

### Installation

1. **Clone or download the repository:**
```bash
git clone https://github.com/youneedgreg/backend-wizards-stage1.git
cd backend-wizards-stage1
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file with your information:**
```bash
USER_EMAIL=your.email@gmail.com
USER_NAME=Your Full Name
USER_STACK=Node.js/Express
PORT=3000
NODE_ENV=development
```

### Running Locally
```bash
npm start
```

Server runs on `http://localhost:3000`

You should see:
```
╔════════════════════════════════════════╗
║   🧙 Backend Wizards Stage 1 API 🧙   ║
║   String Analyzer Service              ║
║   Server running on port 3000          ║
║   Local: http://localhost:3000         ║
╚════════════════════════════════════════╝
```

## 📡 API Endpoints

### 1. Analyze String (POST)

Create and analyze a new string.

**Endpoint:** `POST /strings`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "value": "Hello World"
}
```

**Success Response (201 Created):**
```json
{
  "id": "a591fad9ffaec648a37e646bad83e901e7c28ccb60c18b4fda23457359e06b0f",
  "value": "Hello World",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "a591fad9ffaec648a37e646bad83e901e7c28ccb60c18b4fda23457359e06b0f",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "W": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Responses:**
- `409 Conflict` - String already exists
- `400 Bad Request` - Invalid request body or missing "value" field
- `422 Unprocessable Entity` - Invalid data type for "value" (must be string)

---

### 2. Get Specific String (GET)

Retrieve a specific analyzed string by its value.

**Endpoint:** `GET /strings/{string_value}`

**Example:** `GET /strings/HelloWorld`

**Success Response (200 OK):**
```json
{
  "id": "a591fad9ffaec648a37e646bad83e901e7c28ccb60c18b4fda23457359e06b0f",
  "value": "Hello World",
  "properties": { /* ... */ },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - String does not exist

---

### 3. Get All Strings with Filters (GET)

Retrieve all strings with optional filtering.

**Endpoint:** `GET /strings`

**Query Parameters:**
- `is_palindrome` (boolean) - Filter palindromic strings
- `min_length` (integer) - Minimum string length
- `max_length` (integer) - Maximum string length
- `word_count` (integer) - Exact word count
- `contains_character` (string) - Contains specific character

**Example Request:**
```
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=1
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "racecar",
      "properties": { /* ... */ },
      "created_at": "2025-10-21T10:00:00Z"
    },
    {
      "id": "hash2",
      "value": "level",
      "properties": { /* ... */ },
      "created_at": "2025-10-21T10:01:00Z"
    }
  ],
  "count": 2,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 1
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid query parameter values or types

---

### 4. Natural Language Query Filter (GET)

Filter strings using natural language queries.

**Endpoint:** `GET /strings/filter-by-natural-language`

**Query Parameter:**
- `query` (string) - Natural language query

**Supported Query Examples:**
- "all single word palindromic strings" → `word_count=1, is_palindrome=true`
- "strings longer than 10 characters" → `min_length=11`
- "palindromic strings" → `is_palindrome=true`
- "strings containing the letter a" → `contains_character=a`
- "strings with exactly 2 words" → `word_count=2`

**Example Request:**
```
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Success Response (200 OK):**
```json
{
  "data": [
    { /* matching strings */ }
  ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Unable to parse natural language query
- `422 Unprocessable Entity` - Query parsed but resulted in conflicting filters

---

### 5. Delete String (DELETE)

Delete an analyzed string.

**Endpoint:** `DELETE /strings/{string_value}`

**Example:** `DELETE /strings/HelloWorld`

**Success Response:** `204 No Content` (empty response body)

**Error Responses:**
- `404 Not Found` - String does not exist

---

## 🧪 Testing

### Test with curl
```bash
# Create/Analyze a string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "Hello World"}'

# Get specific string
curl http://localhost:3000/strings/HelloWorld

# Get all strings
curl http://localhost:3000/strings

# Get with filters
curl "http://localhost:3000/strings?is_palindrome=true&min_length=5"

# Natural language query
curl "http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20palindromes"

# Delete string
curl -X DELETE http://localhost:3000/strings/HelloWorld
```

## 📦 Dependencies

- **express** - Web server framework
- **axios** - HTTP client
- **dotenv** - Environment variable management
- **crypto** - Built-in Node.js module for SHA256 hashing

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `USER_EMAIL` | Your email | your.email@gmail.com |
| `USER_NAME` | Your full name | John Doe |
| `USER_STACK` | Tech stack | Node.js/Express |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

---

## 📁 File Structure
```
backend-wizards-stage1/
├── src/
│   ├── index.js                 # Main server file
│   ├── storage.js               # In-memory storage
│   └── utils/
│       ├── stringAnalyzer.js   # String analysis functions
│       └── queryParser.js      # Natural language parsing
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── package.json                 # Dependencies
└── node_modules/                # Installed packages
```

---

## 🔑 Key Concepts

### String Properties Computed

1. **length** - Number of characters
2. **is_palindrome** - Reads same forwards/backwards (case-insensitive)
3. **unique_characters** - Count of distinct characters
4. **word_count** - Number of whitespace-separated words
5. **sha256_hash** - Cryptographic hash for unique identification
6. **character_frequency_map** - Count of each character

### Storage

Strings are stored in memory using a JavaScript object. Each string is identified by its SHA256 hash.

### Filtering

Advanced filtering supports multiple query parameters that are combined with AND logic.

### Natural Language Processing

The API parses natural language queries to automatically generate filter parameters.

---

## 🚀 Deployment

Deploy to Railway:

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Connect GitHub repository
4. Set environment variables
5. Deploy!

---

## ✅ Acceptance Criteria

- ✅ All 5 endpoints implemented and working
- ✅ POST /strings creates and analyzes strings correctly
- ✅ GET /strings/{value} retrieves specific strings
- ✅ GET /strings supports all filter parameters
- ✅ GET /strings/filter-by-natural-language parses queries
- ✅ DELETE /strings/{value} removes strings
- ✅ Correct HTTP status codes (201, 200, 204, 400, 404, 409, 422)
- ✅ Correct response structures with all required fields
- ✅ Content-Type: application/json on all responses
- ✅ Error handling for edge cases
- ✅ Deployed and accessible

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

## 🐛 Debugging

Enable detailed logging:
```bash
DEBUG=* npm start
```

Check console output for:
- Request logs
- Storage operations
- Query parsing details
- Error messages

---

## 📝 Notes

- Strings are stored in memory (will be lost on server restart)
- SHA256 hashes are case-sensitive
- Palindrome detection is case-insensitive
- Character frequency includes all characters (spaces, punctuation, etc.)
- Natural language parsing is flexible and supports variations

---

## 🎓 What You'll Learn

- Advanced string manipulation algorithms
- Cryptographic hashing (SHA256)
- Request body parsing and validation
- Query parameter parsing and filtering
- Natural language processing basics
- In-memory data storage patterns
- HTTP status code selection
- API error handling

---

**Status:** Backend Wizards Stage 1 Project

**Live URL:** https://backend-wizards-stage1-production.up.railway.app

**GitHub:** https://github.com/youneedgreg/backend-wizards-stage1

**Deadline:** Wednesday, October 22, 2025 @ 11:59pm GMT+1 (WAT)
```


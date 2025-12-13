# Backend API Contract: Chat Endpoint

**Feature**: Frontend-Backend Integration for RAG Chatbot
**Version**: 1.0
**Protocol**: HTTP/HTTPS
**Format**: JSON

## Endpoint Specification

### POST /api/chat/query

Submit a question to the RAG system and receive an AI-generated answer with source citations.

**URL**: `/api/chat/query`
**Method**: `POST`
**Content-Type**: `application/json`
**Timeout**: 30 seconds (client-side)

---

## Request

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "question": string
}
```

**Field Specifications**:

| Field      | Type   | Required | Constraints                | Description                    |
|------------|--------|----------|----------------------------|--------------------------------|
| `question` | string | Yes      | 1-10,000 chars, non-empty after trim | User's question to RAG system |

**Validation Rules**:
- Question MUST NOT be empty or whitespace-only after trimming
- Question length MUST be between 1 and 10,000 characters
- Special characters, markdown, code snippets are allowed
- Newlines and multiple spaces preserved

**Example Request**:
```json
{
  "question": "What is semantic search and how does it work?"
}
```

---

## Response

### Success Response (200 OK)

**Status Code**: `200`
**Content-Type**: `application/json`

```json
{
  "answer": string,
  "sources": [
    {
      "title": string,
      "url": string,
      "relevance_score": number
    }
  ] | null,
  "timestamp": string
}
```

**Field Specifications**:

| Field       | Type           | Required | Constraints          | Description                              |
|-------------|----------------|----------|----------------------|------------------------------------------|
| `answer`    | string         | Yes      | 1-50,000 chars       | Generated answer from RAG system         |
| `sources`   | array \| null  | Yes      | 0-10 items           | Source citations (null if no sources)    |
| `timestamp` | string         | Yes      | ISO 8601 format      | Response generation timestamp (UTC)      |

**Source Object Fields**:

| Field             | Type   | Required | Constraints    | Description                   |
|-------------------|--------|----------|----------------|-------------------------------|
| `title`           | string | Yes      | 1-200 chars    | Title of source document      |
| `url`             | string | Yes      | Valid URL      | Absolute or relative URL      |
| `relevance_score` | number | Yes      | 0.0-1.0 (float)| RAG relevance score           |

**Example Success Response**:
```json
{
  "answer": "Semantic search uses vector embeddings to find relevant documents based on meaning rather than exact keyword matches. It transforms both queries and documents into high-dimensional vectors, then uses similarity metrics like cosine distance to find the most relevant results.",
  "sources": [
    {
      "title": "Introduction to Semantic Search",
      "url": "/docs/search/semantic-intro",
      "relevance_score": 0.92
    },
    {
      "title": "Vector Embeddings Explained",
      "url": "/docs/embeddings/overview",
      "relevance_score": 0.85
    }
  ],
  "timestamp": "2025-12-12T10:30:45.123456Z"
}
```

**Example Response with No Sources**:
```json
{
  "answer": "I don't have specific information about that topic in the available documentation.",
  "sources": null,
  "timestamp": "2025-12-12T10:30:45.123456Z"
}
```

---

### Error Responses

#### 400 Bad Request - Validation Error

**Status Code**: `400`
**Cause**: Invalid request payload (empty question, too long, wrong type)

```json
{
  "detail": "Question cannot be empty or whitespace only"
}
```

**Possible `detail` messages**:
- `"Question cannot be empty or whitespace only"`
- `"Question exceeds maximum length of 10,000 characters"`
- `"Invalid request format: 'question' field is required"`

---

#### 422 Unprocessable Entity - Validation Error

**Status Code**: `422`
**Cause**: Pydantic validation failed

```json
{
  "detail": [
    {
      "loc": ["body", "question"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

#### 500 Internal Server Error

**Status Code**: `500`
**Cause**: Backend processing error (RAG system failure, database error, etc.)

```json
{
  "detail": "Internal server error. Please try again later."
}
```

---

#### 503 Service Unavailable

**Status Code**: `503`
**Cause**: Backend temporarily unavailable (maintenance, overload)

```json
{
  "detail": "Service temporarily unavailable. Please try again in a few moments."
}
```

---

## CORS Headers

### Required CORS Configuration

**Allowed Origins** (environment-specific):
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com` (configure via environment variable)

**Allowed Methods**:
```
POST, OPTIONS
```

**Allowed Headers**:
```
Content-Type
```

**Preflight Response Headers**:
```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

**Actual Response Headers**:
```
Access-Control-Allow-Origin: <origin>
```

---

## Client-Side Behavior

### Timeout Handling

- Client sets 30-second timeout using AbortController
- If timeout exceeded, client aborts request and displays timeout error
- Backend may continue processing (client timeout doesn't cancel backend)

### Retry Logic

- Network errors: User can retry via UI button
- Timeout errors: User can retry via UI button
- Backend errors (5xx): User can retry via UI button
- Validation errors (4xx): No retry (user must fix input)

### Error Display

- Parse `detail` field from error responses
- If `detail` is string: Display as-is
- If `detail` is array (422): Extract and format validation messages
- If response is not JSON: Display generic "Server error"

---

## Performance Expectations

**Latency Targets**:
- p50: < 2 seconds (median query)
- p95: < 5 seconds (95th percentile)
- p99: < 10 seconds (99th percentile)

**Rate Limits** (if implemented):
- Not specified (assume no rate limiting for educational site)
- If added later: Return `429 Too Many Requests` with `Retry-After` header

---

## Security Considerations

**Input Validation**:
- Backend MUST validate question length server-side (don't trust client)
- Backend SHOULD sanitize output if returning user input in errors
- Backend MUST NOT execute code from question text

**CORS**:
- MUST validate Origin header against whitelist
- MUST NOT use wildcard `*` for Access-Control-Allow-Origin
- MUST handle OPTIONS preflight requests

**Rate Limiting** (future consideration):
- Consider per-IP rate limiting to prevent abuse
- Consider query complexity limits (e.g., max tokens in question)

---

## Testing Checklist

**Functional Tests**:
- [ ] Valid question returns 200 with answer and sources
- [ ] Valid question with no matching sources returns 200 with null sources
- [ ] Empty question returns 400 with validation error
- [ ] Question >10,000 chars returns 400 with validation error
- [ ] Malformed JSON returns 422 validation error
- [ ] Missing 'question' field returns 422 validation error

**CORS Tests**:
- [ ] OPTIONS preflight from localhost:3000 returns CORS headers
- [ ] POST from localhost:3000 returns CORS headers
- [ ] POST from unauthorized origin returns CORS error (browser blocks)
- [ ] Production origin works in production deployment

**Error Handling Tests**:
- [ ] Backend error (mocked) returns 500 with detail message
- [ ] Timeout (mocked) triggers client-side abort and timeout error

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0     | 2025-12-12 | Initial contract specification   |

## Notes

- Backend implementation MUST follow FastAPI best practices
- Use Pydantic models for automatic OpenAPI documentation
- OpenAPI spec auto-generated at `/docs` endpoint
- This contract is technology-agnostic on client side (works with any HTTP client)

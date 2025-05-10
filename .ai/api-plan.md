# REST API Plan

## 1. Resources

- **Users** - `users` table - Application users
- **Meeting Preferences** - `meeting_preferences` table - User preferences for scheduling meetings
- **Meeting Categories** - `meeting_categories` table - Categories of meetings with suggested attire
- **Meetings** - `meetings` table - Scheduled meetings with details
- **Proposal Stats** - `proposal_stats` table - Statistics on AI proposal generation and acceptance
- **Google Calendar Integration** - Handles integration with Google Calendar for exporting meetings

## 2. Endpoints

### Authentication

### User Profile

#### Get Profile
- **Method:** GET
- **Path:** `/profile`
- **Description:** Get current user's profile
- **Response Body:**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### Update Profile
- **Method:** PUT
- **Path:** `/profile`
- **Description:** Update current user's profile
- **Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "password": "string" // Optional
}
```
- **Response Body:**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "updatedAt": "timestamp"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

### Meeting Preferences

#### Get Meeting Preferences
- **Method:** GET
- **Path:** `/preferences`
- **Description:** Get current user's meeting preferences
- **Response Body:**
```json
{
  "id": "uuid",
  "preferredDistribution": "string", // "rozłożone" or "skondensowane"
  "preferredTimesOfDay": ["string"], // Array of "rano", "dzień", "wieczór"
  "minBreakMinutes": "number",
  "unavailableWeekdays": ["number"] // Array of weekday numbers (0-6)
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### Create or Update Meeting Preferences
- **Method:** PUT
- **Path:** `/preferences`
- **Description:** Create or update user's meeting preferences
- **Request Body:**
```json
{
  "preferredDistribution": "string", // "rozłożone" or "skondensowane"
  "preferredTimesOfDay": ["string"], // Array of "rano", "dzień", "wieczór"
  "minBreakMinutes": "number",
  "unavailableWeekdays": ["number"] // Array of weekday numbers (0-6)
}
```
- **Response Body:**
```json
{
  "id": "uuid",
  "preferredDistribution": "string",
  "preferredTimesOfDay": ["string"],
  "minBreakMinutes": "number",
  "unavailableWeekdays": ["number"]
}
```
- **Success Codes:** 200 OK (Updated), 201 Created (New)
- **Error Codes:** 400 Bad Request, 401 Unauthorized

### Meeting Categories

#### Get All Meeting Categories
- **Method:** GET
- **Path:** `/meeting-categories`
- **Description:** Get all available meeting categories
- **Response Body:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  }
]
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

### Meetings

#### Get All Meetings
- **Method:** GET
- **Path:** `/meetings`
- **Description:** Get all user's meetings with pagination, filtering and sorting
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `startDate`: Filter by start date (ISO format)
  - `endDate`: Filter by end date (ISO format)
  - `categoryId`: Filter by category ID
  - `sort`: Sort field (default: startTime)
  - `order`: Sort order (asc/desc, default: asc)
- **Response Body:**
```json
{
  "meetings": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "category": {
        "id": "uuid",
        "name": "string",
        "suggestedAttire": "string"
      },
      "startTime": "timestamp",
      "endTime": "timestamp",
      "locationName": "string",
      "coordinates": {
        "x": "number",
        "y": "number"
      },
      "aiGenerated": "boolean",
      "aiGeneratedNotes": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Get Upcoming Meetings
- **Method:** GET
- **Path:** `/meetings/upcoming`
- **Description:** Get user's upcoming meetings
- **Query Parameters:**
  - `limit`: Maximum number of meetings to return (default: 10)
- **Response Body:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "category": {
      "id": "uuid",
      "name": "string",
      "suggestedAttire": "string"
    },
    "startTime": "timestamp",
    "endTime": "timestamp",
    "locationName": "string",
    "coordinates": {
      "x": "number",
      "y": "number"
    },
    "aiGenerated": "boolean",
    "aiGeneratedNotes": "string",
    "createdAt": "timestamp"
  }
]
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### Get Meeting
- **Method:** GET
- **Path:** `/meetings/:id`
- **Description:** Get a specific meeting by ID
- **Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  },
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  },
  "aiGenerated": "boolean",
  "originalNote": "string",
  "aiGeneratedNotes": "string",
  "createdAt": "timestamp"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### Create Meeting
- **Method:** POST
- **Path:** `/meetings`
- **Description:** Create a new meeting manually
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "categoryId": "uuid",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  }
}
```
- **Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  },
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  },
  "aiGenerated": false,
  "createdAt": "timestamp",
  "conflicts": [
    {
      "id": "uuid",
      "title": "string",
      "startTime": "timestamp",
      "endTime": "timestamp"
    }
  ]
}
```
- **Success Codes:** 201 Created, 409 Conflict (with conflicts array)
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Update Meeting
- **Method:** PUT
- **Path:** `/meetings/:id`
- **Description:** Update an existing meeting
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "categoryId": "uuid",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  }
}
```
- **Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  },
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  },
  "aiGenerated": "boolean",
  "originalNote": "string",
  "aiGeneratedNotes": "string",
  "updatedAt": "timestamp",
  "conflicts": [
    {
      "id": "uuid",
      "title": "string",
      "startTime": "timestamp",
      "endTime": "timestamp"
    }
  ]
}
```
- **Success Codes:** 200 OK, 409 Conflict (with conflicts array)
- **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete Meeting
- **Method:** DELETE
- **Path:** `/meetings/:id`
- **Description:** Delete a meeting (soft delete)
- **Response Body:**
```json
{
  "message": "Meeting deleted successfully"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

### AI Integration

#### Analyze Meeting Note
- **Method:** POST
- **Path:** `/ai/analyze-note`
- **Description:** Analyze a meeting note and categorize it
- **Request Body:**
```json
{
  "note": "string"
}
```
- **Response Body:**
```json
{
  "analyzedNote": "string",
  "suggestedCategory": {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  },
  "suggestedTitle": "string",
  "suggestedDescription": "string",
  "estimatedDuration": "number" // in minutes
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Generate Meeting Proposals
- **Method:** POST
- **Path:** `/ai/meeting-proposals`
- **Description:** Generate meeting proposals based on note and preferences
- **Request Body:**
```json
{
  "note": "string",
  "locationName": "string",
  "estimatedDuration": "number" // in minutes (optional)
}
```
- **Response Body:**
```json
{
  "proposals": [
    {
      "startTime": "timestamp",
      "endTime": "timestamp",
      "title": "string",
      "description": "string",
      "categoryId": "uuid",
      "categoryName": "string",
      "suggestedAttire": "string",
      "locationName": "string",
      "aiGeneratedNotes": "string",
      "originalNote": "string"
    }
  ]
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Accept Meeting Proposal
- **Method:** POST
- **Path:** `/ai/meeting-proposals/accept`
- **Description:** Accept one of the generated meeting proposals
- **Request Body:**
```json
{
  "startTime": "timestamp",
  "endTime": "timestamp",
  "title": "string",
  "description": "string",
  "categoryId": "uuid",
  "locationName": "string",
  "aiGeneratedNotes": "string",
  "originalNote": "string"
}
```
- **Response Body:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": {
    "id": "uuid",
    "name": "string",
    "suggestedAttire": "string"
  },
  "startTime": "timestamp",
  "endTime": "timestamp",
  "locationName": "string",
  "aiGenerated": true,
  "originalNote": "string",
  "aiGeneratedNotes": "string",
  "createdAt": "timestamp",
  "conflicts": [
    {
      "id": "uuid",
      "title": "string",
      "startTime": "timestamp",
      "endTime": "timestamp"
    }
  ]
}
```
- **Success Codes:** 201 Created, 409 Conflict (with conflicts array)
- **Error Codes:** 400 Bad Request, 401 Unauthorized

### Google Calendar Integration

#### Connect Google Calendar
- **Method:** POST
- **Path:** `/integrations/google-calendar/connect`
- **Description:** Connect user's Google Calendar account
- **Request Body:**
```json
{
  "authCode": "string"
}
```
- **Response Body:**
```json
{
  "connected": true,
  "accountEmail": "string"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Disconnect Google Calendar
- **Method:** DELETE
- **Path:** `/integrations/google-calendar/disconnect`
- **Description:** Disconnect user's Google Calendar account
- **Response Body:**
```json
{
  "message": "Google Calendar disconnected successfully"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### Export Meeting to Google Calendar
- **Method:** POST
- **Path:** `/integrations/google-calendar/export-meeting/:id`
- **Description:** Export a specific meeting to Google Calendar
- **Response Body:**
```json
{
  "success": true,
  "googleEventId": "string"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict (already exported)

#### Export All Meetings to Google Calendar
- **Method:** POST
- **Path:** `/integrations/google-calendar/export-all`
- **Description:** Export all user's meetings to Google Calendar
- **Query Parameters:**
  - `startDate`: Export meetings from this date (ISO format)
- **Response Body:**
```json
{
  "success": true,
  "exportedCount": "number",
  "failedCount": "number"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

### Statistics

#### Get User Statistics
- **Method:** GET
- **Path:** `/stats/user`
- **Description:** Get current user's statistics
- **Query Parameters:**
  - `periodType`: "month" or "year" (default: month)
  - `periodStartDate`: Start date of the period (ISO format, default: current period)
- **Response Body:**
```json
{
  "totalGenerations": "number",
  "acceptedProposals": "number",
  "acceptanceRate": "number", // percentage
  "lastUpdated": "timestamp"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### Get Acceptance Rate
- **Method:** GET
- **Path:** `/stats/acceptance-rate`
- **Description:** Get overall AI proposal acceptance rate
- **Query Parameters:**
  - `periodType`: "month" or "year" (default: all time)
- **Response Body:**
```json
{
  "acceptanceRate": "number", // percentage
  "sampleSize": "number"
}
```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

## 3. Authentication and Authorization

The API will use Supabase Auth for authentication and authorization:

1. **JWT Authentication**
   - Users receive a JWT token upon successful login
   - The token must be included in the Authorization header of subsequent requests
   - Tokens expire after a configurable time period (e.g., 1 hour)
   - Refresh tokens allow obtaining new access tokens without re-authentication

2. **Row Level Security (RLS)**
   - Supabase's Row Level Security ensures users can only access their own data
   - Policies are defined at the database level for each table
   - API endpoints verify user identity using the JWT token
   - All data access is filtered based on the authenticated user ID

3. **Password Security**
   - Passwords are stored as secure hashes, never in plain text
   - Password reset tokens are valid for 30 minutes only
   - Failed login attempts are limited to prevent brute force attacks

## 4. Validation and Business Logic

### User Registration
- Email must be unique
- Email must be valid format
- Password must meet minimum strength requirements
- First name and last name are required

### Meeting Preferences
- Preferred distribution must be either "rozłożone" or "skondensowane"
- Preferred times of day must be from the valid enum values
- Min break minutes must be non-negative
- Unavailable weekdays must be integers between 0-6

### Meetings
- End time must be after start time
- Title is required
- Category must exist in the database
- Meeting conflicts are detected and reported but can be overridden by the user
- Meetings only accessible by the user who created them

### AI-Generated Proposals
- Note text is required for analysis
- System tracks proposal statistics (generations and acceptances)
- User can only accept one proposal from each generation set
- AI proposals respect user's preferences for meeting times and unavailable days

### Google Calendar Integration
- One-way export only (from app to Google Calendar)
- User must authorize the integration before exporting
- Exported meetings are tracked to avoid duplication

### Statistics
- Accepted proposal count cannot exceed total generations
- Statistics are automatically updated when meetings are created or proposals accepted
- Aggregated statistics available for different time periods 
# Student Utility Hub - Technical Documentation

## Architecture Overview

**Stack:**
- Backend: Node.js + Express + TypeScript + MongoDB
- Frontend: React + Vite
- Authentication: JWT with HTTP-only cookies
- Database: MongoDB Atlas (Cloud)

---

## Authentication System

### How It Works:
1. **Signup**: User creates account → Password hashed with bcrypt (7 rounds) → Stored in MongoDB
2. **Login**: User enters credentials → Backend verifies password → Generates JWT token → Sends as HTTP-only cookie
3. **Protected Routes**: Every API request checks JWT token in cookie → Verifies with secret key → Extracts user ID
4. **Logout**: Clears the JWT cookie

### Security Features:
- Passwords hashed with bcrypt (never stored in plain text)
- JWT tokens expire in 7 days
- HTTP-only cookies (JavaScript can't access them)
- CORS configured to only allow frontend origin
- Input validation with Zod (username: 1-12 chars, password: 8-20 chars)

---

## Features & Backend Implementation

### 1. **Weather App**
**How it works:**
- Frontend calls Open-Meteo API (free, no API key needed)
- Gets geocoding data for city name
- Fetches current weather (temperature, humidity, wind speed)
- Backend saves last searched city in user preferences
- Updates tool usage analytics

**Backend:**
- Endpoint: `POST /tools/weather/city`
- Saves city name to user document
- Tracks usage in ToolUsage collection
- Records activity in Activities collection

### 2. **Password Generator**
**How it works:**
- User selects length (6-50) and character types (uppercase, numbers, symbols)
- Backend generates random password using charset
- Saves to PasswordHistory collection
- Returns password to frontend

**Backend Logic:**
```
charset = 'abcdefghijklmnopqrstuvwxyz'
if uppercase: charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
if numbers: charset += '0123456789'
if symbols: charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
password = random selection from charset
```

**Endpoint:** `POST /tools/password/generate`

### 3. **To-Do List**
**How it works:**
- Each user has a Todos document with array of todos
- Each todo has: title, isMarked (completed status), _id
- CRUD operations update the todos array

**Backend:**
- `GET /todo/getAll` - Returns all todos for user
- `POST /todo/new` - Adds new todo to array
- `PUT /todo/update` - Updates todo by ID
- `DELETE /todo/remove` - Removes todo from array

**Data Structure:**
```
{
  uid: ObjectId,
  todos: [
    { _id: ObjectId, title: String, isMarked: Boolean }
  ]
}
```

### 4. **Unit Converter**
**How it works:**
- Converts between length, weight, and temperature units
- Uses conversion factors to base units (meters for length, kg for weight)
- Formula: `result = (value × fromFactor) / toFactor`

**Supported Conversions:**
- Length: m, km, cm, mm, mi, yd, ft, in
- Weight: kg, g, mg, lb, oz, ton
- Temperature: C, F, K (special formulas)

**Backend:**
- Endpoint: `POST /tools/converter/convert`
- Validates units and conversion type
- Performs calculation
- Returns result rounded to 4 decimals

### 5. **Notes App**
**How it works:**
- Each user has a Notes document with array of notes
- Each note has: title, description, _id
- Backend tracks last opened note in user preferences

**Backend:**
- `GET /note/getAll` - Returns all notes
- `POST /note/new` - Creates new note
- `PUT /note/update` - Updates note by ID
- `DELETE /note/remove` - Removes note
- `GET /tools/note/last` - Gets last opened note ID
- `PUT /tools/note/last` - Updates last opened note

### 6. **URL Shortener**
**How it works:**
- Generates random 6-character short code
- Stores mapping: shortCode → originalUrl
- Tracks click count for each URL
- Each URL document belongs to a user

**Backend:**
- `POST /url/new` - Creates short URL with random code
- `GET /url/getAll` - Returns all user's URLs
- `DELETE /url/remove` - Deletes URL
- `GET /url/goto/:shortCode` - Redirects to original URL, increments clicks

**Short Code Generation:**
```
charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
shortCode = 6 random characters from charset
```

---

## Analytics & Dashboard

### Tool Usage Tracking:
- Every tool use updates ToolUsage collection
- Stores: tool name, usage count, last used timestamp
- Dashboard shows recently used tools sorted by last used date

### Activity History:
- Every action (login, logout, tool use) recorded in Activities collection
- Stores: action description, timestamp
- Displayed in reverse chronological order

### Analytics Page:
- Total actions count
- Most used tool (highest usage count)
- Tool usage breakdown with counts
- Activity timeline

**Backend:**
- `GET /tools/dashboard/recent-tools` - Returns tools sorted by lastUsed
- `GET /tools/activity/history` - Returns recent activities
- `GET /tools/analytics` - Returns aggregated stats

---

## User Preferences

**Stored in User document:**
- darkMode: Boolean
- defaultCity: String (for weather)
- preferredTemperatureUnit: C/F/K
- preferredLengthUnit: m/km/cm/etc
- preferredWeightUnit: kg/g/lb/etc

**Backend:**
- `GET /tools/preferences` - Returns user preferences
- `PUT /tools/preferences` - Updates preferences

---

## Database Schema

### Users Collection:
```
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  lastNote: ObjectId,
  lastCityWeather: String,
  preferences: {
    darkMode: Boolean,
    defaultCity: String,
    preferredTemperatureUnit: String,
    preferredLengthUnit: String,
    preferredWeightUnit: String
  }
}
```

### Activities Collection:
```
{
  uid: ObjectId (user reference),
  history: [
    { action: String, time: Date }
  ]
}
```

### Todos Collection:
```
{
  uid: ObjectId,
  todos: [
    { title: String, isMarked: Boolean }
  ]
}
```

### Notes Collection:
```
{
  uid: ObjectId,
  notes: [
    { title: String, description: String }
  ]
}
```

### URLs Collection:
```
{
  uid: ObjectId,
  shortUrl: String (unique),
  originalUrl: String,
  clicks: Number
}
```

### ToolUsage Collection:
```
{
  uid: ObjectId,
  tools: [
    { name: String, usageCount: Number, lastUsed: Date }
  ]
}
```

### PasswordHistory Collection:
```
{
  uid: ObjectId,
  passwords: [
    { password: String, generatedAt: Date }
  ]
}
```

---

## Middleware

### 1. verifyUser (Authentication):
- Extracts JWT token from cookies
- Verifies token with secret key
- Decodes user ID from token
- Attaches userId to request object
- Used on all protected routes

### 2. checkCredentials (Validation):
- Validates username format (1-12 chars, alphanumeric + underscore)
- Validates password length (8-20 chars)
- Uses Zod for schema validation
- Used on signup/login routes

### 3. errorMiddleware (Error Handling):
- Catches all errors from routes
- Formats error response
- Returns consistent error structure

### 4. asyncHandler (Wrapper):
- Wraps async route handlers
- Catches promise rejections
- Passes errors to error middleware

---

## API Response Format

**Success:**
```json
{
  "status": 200,
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": 400,
  "success": false,
  "message": "Error description"
}
```

---

## Key Technical Decisions

1. **JWT in HTTP-only cookies**: More secure than localStorage (prevents XSS attacks)
2. **MongoDB subdocuments**: Todos/Notes stored as arrays in user documents (faster queries)
3. **Tool usage tracking**: Separate collection for analytics without affecting main data
4. **Open-Meteo API**: Free weather API, no key required, reliable
5. **TypeScript backend**: Type safety, better IDE support, fewer runtime errors
6. **Vite for frontend**: Faster builds and HMR than Create React App
7. **CSS Variables for theming**: Easy dark/light mode switching
8. **Bcrypt for passwords**: Industry standard, slow hashing prevents brute force

---

## Performance Optimizations

1. **Database indexes**: Unique indexes on username, shortUrl
2. **Selective field queries**: Only fetch needed fields
3. **Array operations**: Use MongoDB $push, $pull for efficiency
4. **Frontend caching**: Store preferences in localStorage
5. **Lazy loading**: Routes loaded on demand
6. **Debouncing**: Prevent excessive API calls

---

## Security Measures

1. **Password hashing**: Bcrypt with 7 salt rounds
2. **JWT expiration**: 7-day token lifetime
3. **HTTP-only cookies**: JavaScript can't access tokens
4. **CORS restrictions**: Only allow specific origins
5. **Input validation**: Zod schemas for all inputs
6. **Error messages**: Generic messages (don't reveal system details)
7. **Rate limiting**: Can be added with express-rate-limit
8. **SQL injection prevention**: MongoDB parameterized queries

---

## Deployment Considerations

**Backend:**
- Set ENVIRONMENT=PRODUCTION in .env
- Use secure cookies (secure: true)
- Add rate limiting
- Enable compression
- Use PM2 for process management

**Frontend:**
- Build with `npm run build`
- Serve static files with nginx/Apache
- Enable gzip compression
- Use CDN for assets

**Database:**
- MongoDB Atlas (already cloud-hosted)
- Enable authentication
- Whitelist IP addresses
- Regular backups

---

## Testing the Application

1. **Signup**: Create account → Check user in database
2. **Login**: Login → Check JWT cookie set
3. **Weather**: Search city → Check API call, data display
4. **Password Gen**: Generate → Check password returned, history saved
5. **Todos**: Add/Edit/Delete → Check database updates
6. **Notes**: Create/Update → Check persistence
7. **URL Shortener**: Create short URL → Test redirect, click tracking
8. **Converter**: Convert units → Verify calculations
9. **Analytics**: Use tools → Check usage stats update
10. **Dark Mode**: Toggle theme → Check CSS variables change
11. **Logout**: Logout → Check cookie cleared, redirect to login

---

## Common Issues & Solutions

**Network Error on Login:**
- Backend not running → Start with `node dist/index.js`
- Wrong port → Check CORS allows frontend port
- MongoDB not connected → Check MONGODB_URL in .env

**Password Generator Not Working:**
- Check browser console for errors
- Verify JWT token in cookies
- Check backend logs for errors

**Dark Mode Not Switching:**
- Check data-theme attribute on html element
- Verify CSS variables defined for both themes
- Check localStorage for darkMode value

**Features Not Persisting:**
- Check user is logged in (JWT cookie present)
- Verify MongoDB connection
- Check userId attached to requests

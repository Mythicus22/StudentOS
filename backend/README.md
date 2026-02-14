# User Routes

## 1. Signup

**Endpoint**

```
POST /user/signup
```

**Description**  
Creates a new user account.

**Required Body Fields**

| Field    | Type   | Required | Description                         |
|----------|--------|----------|-------------------------------------|
| username | string | Yes      | Unique username (case-insensitive) |
| password | string | Yes      | User password (will be hashed)     |

**Example Request**

```json
{
  "username": "nitin",
  "password": "mypassword123"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Signup successful!",
  "data": null
}
```

**Error Response**

```json
{
  "status": 409,
  "success: false,
  "message": "A user with this username already exists!"
}
```

---

## 2. Login

**Endpoint**

```
POST /user/login
```

**Description**  
Authenticates user and sets an authentication token in cookies.

**Required Body Fields**

| Field    | Type   | Required | Description   |
|----------|--------|----------|---------------|
| username | string | Yes      | User username |
| password | string | Yes      | User password |

**Example Request**

```json
{
  "username": "nitin",
  "password": "mypassword123"
}
```

**Success Response**

Cookie set:

```
Set-Cookie: token=jwt_token_here; HttpOnly; SameSite=Lax; Path=/
```

Body:

```json
{
  "status": 200,
  "message": "Login Successful.",
  "success: true,
  "data": null
}
```

**Error Response**

```json
{
  "status": 401,
  "success": false,
  "message": "Invalid credentials."
}
```

---

## 3. Logout

**Endpoint**

```
POST /user/logout
```

**Description**  
Logs out the user and clears authentication cookie.

**Required**

Authentication cookie must be present.

**Example Request**

```
POST /user/logout
Cookie: token=jwt_token_here
```

**Success Response**

Cookie cleared:

```
Set-Cookie: token=; expires=Thu, 01 Jan 1970 00:00:00 GMT
```

Body:

```json
{
  "status": 200,
  "success": true,
  "message": "Logged Out Successfully.",
  "data": null
}
```

**Error Response**

```json
{
  "status": 401,
  "success": false,
  "message": "Invalid token. Please login again."
}
```

## 4. Update user activity
## All the actions in the backend always update the user's history automatically. If you implement some feature on the frontend (like weather) then use this route to update the user's activity.

**Endpoint**

```
POST /user/activity
```

Adds a new activity entry to the authenticated user's activity history.

**Authentication Required:** Yes

---

## Request Body

```json
{
  "action": "Created a new note",
  "time": "2026-02-14T10:30:00.000Z"
}
```

---

## Accepted Fields

| Field  | Type   | Required | Description |
|--------|--------|----------|-------------|
| action | string | Yes      | Description of the activity performed |
| time   | string (ISO 8601 Date) | Yes | Timestamp of when the activity occurred |

---

## Success Response

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Activity updated successfully."
}
```

---

## Error Responses

**Missing required fields**

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Please provide both action and time."
}
```

**Invalid time format**

```json
{
  "status": 400,
  "success": false,
  "message": "Invalid time format."
}
```

---


# Todo Routes

All todo routes require authentication cookie. Name for the cookie is token, which is auto sent by the browser.

---

## 1. Get All Todos

**Endpoint**

```
GET /todo/getAll
```

**Description**  
Fetches all todos for the authenticated user.

**Required Body Fields**

None

**Example Request**

```
GET /todo/getAll
Cookie: token=jwt_token_here
```

**Success Response**

**NOTE: Make sure to store _id in the ui for the component using this info given by the response. This will help to handle other requests because they need this id.**

```json
{
  "status": 200,
  "success": true,
  "message": "Todos fetched successfully.",
  "data": {
    "todos": [
      {
        "_id": "65f1a2b3c4d5e6f789012345",
        "title": "Buy groceries",
        "isMarked": false
      },
      {
        "_id": "65f1a2b3c4d5e6f789012346",
        "title": "Complete project",
        "isMarked": true
      }
    ]
  }
}
```

---

## 2. Add Todo

**Endpoint**

```
POST /todo/new
```

**Description**  
Adds a new todo for the authenticated user.

**Required Body Fields**

| Field    | Type    | Required | Description                        |
|----------|---------|----------|------------------------------------|
| title    | string  | Yes      | Title of the todo                 |
| isMarked | boolean | Yes      | Completion status of the todo     |

**Example Request**

```json
{
  "title": "Learn MongoDB",
  "isMarked": false
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Todo added successfully.",
  "data": {
    "todo": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "title": "Learn MongoDB",
      "isMarked": false
    }
  }
}
```

**Error Response**

```json
{
  "status": 422,
  "success: false,
  "message": "Missing required fields in body: need both title and isMarked."
}
```

---

## 3. Update Todo

**Endpoint**

```
PUT /todo/update
```

**Description**  
Updates an existing todo.

**Required Body Fields**

| Field    | Type    | Required | Description                    |
|----------|---------|----------|--------------------------------|
| todoId   | string  | Yes      | ID of the todo to update      |
| title    | string  | Yes      | Updated title                 |
| isMarked | boolean | Yes      | Updated completion status     |

**Example Request**

```json
{
  "todoId": "65f1a2b3c4d5e6f789012347",
  "title": "Learn MongoDB Advanced",
  "isMarked": true
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Todo updated successfully.",
  "data": {
    "todo": {
      "_id": "65f1a2b3c4d5e6f789012347",
      "title": "Learn MongoDB Advanced",
      "isMarked": true
    }
  }
}
```

**Error Responses**

Invalid ID:
```json
{
  "status": 400,
  "success: false,
  "message": "Invalid Todo ID."
}
```

Todo not found:
```json
{
  "status": 404,
  "success: false,
  "message": "Todo not found."
}
```

Missing fields:
```json
{
  "status": 422,
  "success: false,
  "message": "Missing required fields in body: need both title and isMarked."
}
```

---

## 4. Delete Todo

**Endpoint**

```
DELETE /todo/remove
```

**Description**  
Deletes a todo.

**Required Body Fields**

| Field  | Type   | Required | Description              |
|--------|--------|----------|--------------------------|
| todoId | string | Yes      | ID of the todo to delete |

**Example Request**

```json
{
  "todoId": "65f1a2b3c4d5e6f789012347"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Todo deleted successfully",
  "data": null
}
```

**Error Responses**

Invalid ID:
```json
{
  "status": 400,
  "success: false,
  "message": "Invalid Todo ID."
}
```

Todo not found:
```json
{
  "status": 404,
  "success: false,
  "message": "Todo not found."
}
```

---

# Note Routes

All note routes require authentication cookie.

---

## 1. Get All Notes

**Endpoint**

```
GET /note/getAll
```

**Description**  
Fetches all notes for the authenticated user.

**Required Body Fields**

None

**Example Request**

```
GET /note/getAll
Cookie: token=jwt_token_here
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Notes fetched successfully.",
  "data": {
    "notes": [
      {
        "_id": "65f1b2c3d4e5f6a789012345",
        "title": "Meeting Notes",
        "description": "Discuss project timeline"
      },
      {
        "_id": "65f1b2c3d4e5f6a789012346",
        "title": "Ideas",
        "description": "Build a SaaS product"
      }
    ]
  }
}
```

---

## 2. Add Note

**Endpoint**

```
POST /note/new
```

**Description**  
Adds a new note.

**Required Body Fields**

| Field       | Type   | Required | Description             |
|-------------|--------|----------|-------------------------|
| title       | string | Yes      | Title of the note       |
| description | string | Yes      | Description of the note |

**Example Request**

```json
{
  "title": "Project Plan",
  "description": "Finish backend and frontend"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Note added successfully.",
  "data": {
    "note": {
      "_id": "65f1b2c3d4e5f6a789012347",
      "title": "Project Plan",
      "description": "Finish backend and frontend"
    }
  }
}
```

**Error Response**

```json
{
  "status": 422,
  "success: false,
  "message": "Missing required fields in body: need both title and description."
}
```

---

## 3. Update Note

**Endpoint**

```
PUT /note/update
```

**Description**  
Updates an existing note.

**Required Body Fields**

| Field       | Type   | Required | Description               |
|-------------|--------|----------|---------------------------|
| noteId      | string | Yes      | ID of the note to update  |
| title       | string | Yes      | Updated title             |
| description | string | Yes      | Updated description       |

**Example Request**

```json
{
  "noteId": "65f1b2c3d4e5f6a789012347",
  "title": "Updated Project Plan",
  "description": "Finish backend, frontend, and deployment"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Note updated successfully.",
  "data": {
    "note": {
      "_id": "65f1b2c3d4e5f6a789012347",
      "title": "Updated Project Plan",
      "description": "Finish backend, frontend, and deployment"
    }
  }
}
```

**Error Responses**

Invalid ID:
```json
{
  "status": 400,
  "success: false,
  "message": "Invalid Note ID."
}
```

Note not found:
```json
{
  "status": 404,
  "success: false,
  "message": "Note not found."
}
```

Missing fields:
```json
{
  "status": 422,
  "success: false,
  "message": "Missing required fields in body: need both title and description."
}
```

---

## 4. Delete Note

**Endpoint**

```
DELETE /note/remove
```

**Description**  
Deletes a note.

**Required Body Fields**

| Field  | Type   | Required | Description              |
|--------|--------|----------|--------------------------|
| noteId | string | Yes      | ID of the note to delete |

**Example Request**

```json
{
  "noteId": "65f1b2c3d4e5f6a789012347"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Note deleted successfully.",
  "data": null
}
```

**Error Responses**

Invalid ID:
```json
{
  "status": 400,
  "success: false,
  "message": "Invalid Note ID."
}
```

Note not found:
```json
{
  "status": 404,
  "success: false,
  "message": "Note not found."
}
```

---

# URL Routes

All URL routes require authentication cookie except the redirect route.

---

## 1. Get All URLs

**Endpoint**

```
GET /url/getAll
```

**Description**  
Fetches all short URLs created by the authenticated user.

**Required Body Fields**

None

**Example Request**

```
GET /url/getAll
Cookie: token=jwt_token_here
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "URLs fetched successfully.",
  "data": {
    "urls": [
      {
        "_id": "65f1c2d3e4f5a6b789012345",
        "originalUrl": "https://example.com",
        "shortUrl": "http://localhost:3000/url/goto/abc1234",
        "clicks": 5
      }
    ]
  }
}
```

---

## 2. Create Short URL

**Endpoint**

```
POST /url/new
```

**Description**  
Creates a new short URL.

**Required Body Fields**

| Field       | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| originalUrl | string | Yes      | The original URL to shorten     |

**Example Request**

```json
{
  "originalUrl": "https://google.com"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Url created successfully.",
  "data": {
    "shortUrl": "http://localhost:3000/url/goto/abc12340"
  }
}
```

**Error Response**

```json
{
  "status": 400,
  "success: false,
  "message": "No Url provided."
}
```

---

## 3. Remove Short URL

**Endpoint**

```
DELETE /url/remove
```

**Description**  
Deletes a short URL.

**Required Body Fields**

| Field    | Type   | Required | Description                 |
|----------|--------|----------|-----------------------------|
| shortUrl | string | Yes      | The short URL to delete     |

**Example Request**

```json
{
  "shortUrl": "http://localhost:3000/url/goto/abc12340"
}
```

**Success Response**

```json
{
  "status": 200,
  "success: true,
  "message": "Url removed.",
  "data": null
}
```

**Error Responses**

No URL provided:
```json
{
  "status": 400,
  "success: false,
  "message": "No url provided."
}
```

URL not found:
```json
{
  "status": 404,
  "success: false,
  "message": "No such url exists."
}
```

---

## 4. Use Short URL (Redirect)
## Do not make any ui for it, the user can just paste the link in browser to get to the destination.

**Endpoint**

```
GET /url/goto/:shortCode
```

**Description**  
Redirects to the original URL and increments click count.

**Authentication Required**

No

**Example Request**

```
GET /url/goto/abc12340
```

**Success Response**

Redirect response:

```
HTTP/1.1 302 Found
Location: https://google.com
```

**Error Response**

Invalid URL:
```json
{
  "status": 404,
  "success: false,
  "message": "Invalid url."
}
```

---
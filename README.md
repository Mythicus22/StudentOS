# Student Utility Hub - Full Stack Application

A powerful all-in-one student utility web application built with Node.js/Express backend and React frontend. Features user authentication, persistent data storage, and 6 utility tools to boost productivity.

## 🎯 Features

### Core Authentication
- ✅ User Registration & Login
- ✅ JWT-based Authentication  
- ✅ Secure Password Hashing (bcrypt)
- ✅ Protected Routes

### Student Utility Tools
1. **🌤️ Weather App**
   - Search weather by city
   - Auto-save last searched city
   - Real-time weather data from Open-Meteo API
   - Temperature, humidity, wind speed display

2. **🔐 Password Generator**
   - Generate secure passwords
   - Customizable length & character types
   - Usage tracking
   - One-click copy to clipboard

3. **✓ To-Do List**
   - Create, read, update, delete tasks
   - Mark tasks as complete/pending
   - Persistent storage per user
   - Real-time task management

4. **📏 Unit Converter**
   - Length conversion (m, km, cm, mm, mi, yd, ft, in)
   - Weight conversion (kg, g, mg, lb, oz, ton)
   - Temperature conversion (C, F, K)
   - Frequently used units reminder

5. **📝 Notes App**
   - Create and edit rich notes
   - Auto-save last opened note
   - Note deletion
   - User data isolation

6. **🔗 URL Shortener**
   - Shorten long URLs
   - Track click count per link
   - Copy short URL to clipboard
   - Remove shortened URLs

### Dashboard & Analytics
- 📊 **Recently Used Tools** - Auto-sorted by frequency
- 📈 **Usage Analytics** - View most used tools and stats
- 📜 **Activity History** - Complete action timeline
- ⚙️ **Preferences** - Dark/Light mode, default city, unit preferences

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URL and JWT Secret
# MONGODB_URL=mongodb://localhost:27017/student-hub
# JWT_SECRET=your_secret_key_here

# Build TypeScript
npm run build

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:3001
```

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /user/signup` - Register new user
- `POST /user/login` - Login user
- `POST /user/logout` - Logout user

### Todos
- `GET /todo/getAll` - Get all todos
- `POST /todo/new` - Create todo
- `PUT /todo/update` - Update todo
- `DELETE /todo/remove` - Delete todo

### Notes
- `GET /note/getAll` - Get all notes
- `POST /note/new` - Create note
- `PUT /note/update` - Update note
- `DELETE /note/remove` - Delete note

### URLs
- `GET /url/getAll` - Get all shortened URLs
- `POST /url/new` - Create short URL
- `DELETE /url/remove` - Delete short URL
- `GET /url/goto/:shortCode` - Redirect to original URL

### Tools & Analytics
- `POST /tools/password/generate` - Generate password
- `POST /tools/converter/convert` - Convert units
- `POST /tools/weather/city` - Update weather city
- `GET /tools/activity/history` - Get activity history
- `GET /tools/dashboard/recent-tools` - Get recently used tools
- `GET /tools/analytics` - Get usage analytics
- `GET /tools/preferences` - Get user preferences
- `PUT /tools/preferences` - Update user preferences

## 🎨 UI/UX Features

- ✨ Light & Dark Theme Support
- 📱 Fully Responsive Design
- ⚡ Smooth Animations & Transitions
- 🎯 Intuitive Navigation
- 🔔 Real-time Feedback
- ♿ Accessible Components

## 🔐 Security

- JWT tokens with 7-day expiration
- HTTP-only cookies for token storage
- Password hashing with bcrypt (7 rounds)
- Input validation with Zod
- CORS configured
- Protected routes with middleware

## 🧪 Testing

To test the application:

1. **Create account**: Sign up with a username and password
2. **Use tools**: Try each tool and watch the analytics update
3. **Check preferences**: Update theme and units in settings
4. **View analytics**: See usage history and stats on dashboard
5. **Test persistence**: Refresh page - data persists

## 📝 Environment Variables

Create `.env` in backend folder:

```
MONGODB_URL=mongodb://localhost:27017/student-hub
JWT_SECRET=your_super_secret_jwt_key_change_this
ENVIRONMENT=DEVELOPMENT
PORT=3000
```

## 🐛 Known Issues & Limitations

- Weather API (Open-Meteo) may have rate limits
- File uploads not supported
- Single-user per browser session
- No email verification

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Build
npm run build

# Deploy with package.json and dist folder
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy dist folder
```

## 📚 Future Enhancements

- [ ] Real-time notifications
- [ ] Social sharing features
- [ ] Mobile app
- [ ] Advanced analytics with charts
- [ ] File attachments in notes
- [ ] Custom themes
- [ ] Multi-device sync
- [ ] API rate limiting

## 📄 License

MIT License - Feel free to use this project

## 👤 Author

Created as a full-stack web development project

## 🤝 Support

For issues or questions, check the code comments or create an issue.

---

**Happy studying! 🎓**

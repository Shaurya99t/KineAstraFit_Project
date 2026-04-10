# AI Fitness Backend - Phase 1 (MVP)

Production-ready FastAPI backend for an AI-powered fitness web application.

## Features

- ✅ User signup with secure password hashing (bcrypt)
- ✅ AI fitness chat using Groq API (llama3-70b-8192)
- ✅ SQLite database with SQLAlchemy ORM
- ✅ RESTful API with proper validation
- ✅ Interactive API documentation (Swagger UI)

## Project Structure

```
├── app.py              # Main FastAPI application
├── database.py         # Database connection setup
├── models.py           # SQLAlchemy database models
├── schemas.py          # Pydantic request/response schemas
├── auth.py             # Password hashing utilities
├── groq_client.py      # Groq API integration
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```
GROQ_API_KEY=your_actual_api_key_here
```

Get your API key from: https://console.groq.com/keys

### 3. Run the Server

```bash
uvicorn app:app --reload
```

The API will be available at: `http://localhost:8000`

### 4. API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check

**GET** `/` or `/health`

Check if the service is running.

---

### Signup

**POST** `/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - User already exists

---

### AI Chat

**POST** `/chat`

Get fitness advice from AI trainer.

**Request Body:**
```json
{
  "user_input": "What's a good workout routine for beginners?"
}
```

**Response:**
```json
{
  "response": "Here's a great beginner workout routine..."
}
```

**Status Codes:**
- `200` - Response generated successfully
- `503` - AI service unavailable

---

## Testing with cURL

### Signup a User

```bash
curl -X POST "http://localhost:8000/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@example.com\", \"password\": \"password123\"}"
```

### Chat with AI Trainer

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d "{\"user_input\": \"How can I lose weight effectively?\"}"
```

## Database

The application uses SQLite by default. The database file `fitness_app.db` will be created automatically in the project root when the server starts.

## Security Notes

- Passwords are hashed using bcrypt before storage
- Never commit `.env` file to version control
- Use HTTPS in production
- API key is read from environment variables only

## Next Steps (Future Phases)

- [ ] JWT authentication (login/logout)
- [ ] User profile management
- [ ] Workout history tracking
- [ ] RAG with vector database
- [ ] Meal planning features
- [ ] Progress tracking

## Troubleshooting

**Groq API Key Error:**
- Ensure `GROQ_API_KEY` is set in your `.env` file
- Check that your API key is valid and has credits

**Database Errors:**
- Delete `fitness_app.db` to reset the database
- Ensure write permissions in the project directory

**Import Errors:**
- Run `pip install -r requirements.txt` again
- Check Python version (3.8+ recommended)

## License

MIT License

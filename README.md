# Calendar Week View Application

A full-stack web application that replicates Google Calendar's week view functionality.

## Project Structure

```
.
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
└── .kiro/            # Kiro specs and configuration
```

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- Axios (HTTP client)
- date-fns (date manipulation)
- ESLint & Prettier (code quality)

### Backend
- Node.js with Express
- TypeScript
- Mongoose (MongoDB ODM)
- Express Validator (input validation)
- CORS (cross-origin requests)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## Development

The project follows a spec-driven development approach. See `.kiro/specs/google-calendar-week-view/` for:
- `requirements.md` - Feature requirements
- `design.md` - Technical design
- `tasks.md` - Implementation tasks

## License

ISC

# UniConvert - Smart Document Converter

A modern, full-stack document conversion web application built for college projects. Convert, merge, and compress documents with ease.

## 🚀 Features

### Core Conversions
- DOCX to PDF
- PDF to DOCX
- PPT to PDF
- Excel (XLS/XLSX) to PDF
- JPG/PNG to PDF

### Advanced Features
- Merge multiple PDFs into one
- Compress PDF files (low, medium, high compression)
- Drag and drop file upload
- File size validation (max 10MB)
- Auto-delete files after 1 hour
- Conversion history tracking
- Download count analytics

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Axios
- React Dropzone
- Framer Motion
- Lucide React Icons

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Multer (file uploads)
- LibreOffice CLI (document conversion)
- pdf-lib (PDF merging)
- pdfkit (image to PDF)
- Ghostscript (PDF compression)

## 📋 Prerequisites

Before running this project, you must install the following system dependencies:

### 1. LibreOffice
LibreOffice is required for document conversions (DOCX, PPT, Excel to PDF).

**Windows:**
1. Download from: https://www.libreoffice.org/download/download/
2. Install the `.exe` file
3. Add to PATH: `C:\Program Files\LibreOffice\program`
4. Verify: `soffice --version`

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

**macOS:**
```bash
brew install libreoffice
```

### 2. Ghostscript
Ghostscript is required for PDF compression.

**Windows:**
1. Download from: https://www.ghostscript.com/download/gsdnld.html
2. Install the `.exe` file
3. Add to PATH: `C:\Program Files\gs\gs10.02.1\bin`
4. Verify: `gswin64c --version` or `gs --version`

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ghostscript
```

**macOS:**
```bash
brew install ghostscript
```

### 3. MongoDB
**Windows/macOS:**
- Install MongoDB Community Server from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**Linux:**
```bash
sudo apt-get install mongodb
```

### 4. Node.js
- Download and install Node.js 18+ from: https://nodejs.org/

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
cd docs-con
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/uniconvert
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
CONVERTED_DIR=./converted
FILE_RETENTION_HOURS=1
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Project Structure

```
docs-con/
├── server/                 # Backend (Node.js/Express/TypeScript)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   └── server.ts      # Entry point
│   ├── uploads/           # Temporary upload storage
│   ├── converted/         # Converted files storage
│   └── package.json
│
├── client/                # Frontend (React/Vite/Tailwind)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── utils/        # Helper functions
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   └── package.json
│
└── README.md
```

## 🎨 Features Breakdown

### File Upload
- Drag and drop interface
- File type validation
- Size limit enforcement (10MB)
- Progress indication

### Conversion Types
1. **Document to PDF**: DOCX, PPT, Excel → PDF
2. **PDF to Document**: PDF → DOCX
3. **Image to PDF**: JPG, PNG → PDF
4. **Merge PDFs**: Multiple PDFs → Single PDF
5. **Compress PDF**: Reduce file size with quality options

### History & Analytics
- Track all conversions
- View file sizes (before/after)
- Download count tracking
- Conversion timestamps

## 🔒 Security Features

- File type validation
- File size limits
- Automatic file cleanup
- Environment variable protection
- CORS configuration

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Ensure LibreOffice and Ghostscript are installed on the server
2. Set environment variables
3. Deploy using:
```bash
npm run build
npm start
```

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the `dist` folder

3. Set environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/convert` | Convert a file |
| POST | `/api/merge` | Merge multiple PDFs |
| POST | `/api/compress` | Compress a PDF |
| GET | `/api/download/:filename` | Download converted file |
| GET | `/api/history` | Get conversion history |

## 🤝 Contributing

This is a college project. Feel free to fork and modify for your own use.

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 👨‍💻 Author

Built with ❤️ for college project

## 🐛 Troubleshooting

### LibreOffice not found
- Ensure LibreOffice is installed and added to system PATH
- Restart terminal after installation

### Ghostscript not found
- Ensure Ghostscript is installed and added to system PATH
- On Windows, use `gswin64c` or `gswin32c`

### MongoDB connection error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Port already in use
- Change PORT in backend `.env` file
- Update VITE_API_URL in frontend `.env` file

## 📞 Support

For issues or questions, please create an issue in the repository.

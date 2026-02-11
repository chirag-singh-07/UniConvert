# System Architecture Diagram - UniConvert

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React Frontend]
        C[Vite Dev Server]
    end

    subgraph "Presentation Layer"
        D[React Components]
        E[React Router]
        F[State Management]
        G[Framer Motion]
    end

    subgraph "API Layer"
        H[Axios HTTP Client]
        I[API Service Layer]
    end

    subgraph "Backend Layer"
        J[Express Server]
        K[CORS Middleware]
        L[Multer File Upload]
        M[Error Handler]
    end

    subgraph "Business Logic Layer"
        N[Conversion Controller]
        O[Conversion Service]
        P[File Cleanup Service]
    end

    subgraph "External Tools"
        Q[LibreOffice CLI]
        R[Ghostscript]
        S[pdf-lib]
        T[pdfkit]
    end

    subgraph "Data Layer"
        U[(MongoDB)]
        V[Mongoose ODM]
        W[Conversion Model]
    end

    subgraph "File System"
        X[/uploads/]
        Y[/converted/]
    end

    A --> B
    B --> D
    B --> E
    B --> F
    B --> G
    D --> H
    H --> I
    I --> J
    J --> K
    J --> L
    J --> M
    J --> N
    N --> O
    O --> Q
    O --> R
    O --> S
    O --> T
    O --> V
    V --> W
    W --> U
    O --> X
    O --> Y
    P --> X
    P --> Y

    style A fill:#e1f5ff
    style B fill:#bbdefb
    style J fill:#fff9c4
    style O fill:#ffecb3
    style U fill:#c8e6c9
    style Q fill:#ffccbc
    style R fill:#ffccbc
    style S fill:#ffccbc
    style T fill:#ffccbc
```

## Architecture Overview

### Client Layer
- **Web Browser**: User interface access point
- **React Frontend**: Single-page application built with React 18
- **Vite Dev Server**: Fast development server with HMR

### Presentation Layer
- **React Components**: Modular UI components (Navbar, FileUploader, etc.)
- **React Router**: Client-side routing for navigation
- **State Management**: React hooks for state management
- **Framer Motion**: Smooth animations and transitions

### API Layer
- **Axios HTTP Client**: HTTP request handling
- **API Service Layer**: Abstraction for backend communication

### Backend Layer
- **Express Server**: Node.js web server
- **CORS Middleware**: Cross-origin resource sharing
- **Multer**: Multipart form data and file upload handling
- **Error Handler**: Centralized error handling

### Business Logic Layer
- **Conversion Controller**: Request handling and validation
- **Conversion Service**: Core conversion logic
- **File Cleanup Service**: Automated file deletion (cron job)

### External Tools
- **LibreOffice CLI**: Document conversion (DOCX, PPT, Excel → PDF)
- **Ghostscript**: PDF compression
- **pdf-lib**: PDF merging
- **pdfkit**: Image to PDF conversion

### Data Layer
- **MongoDB**: NoSQL database for conversion history
- **Mongoose ODM**: Object data modeling
- **Conversion Model**: Schema for conversion records

### File System
- **/uploads/**: Temporary storage for uploaded files
- **/converted/**: Storage for converted files

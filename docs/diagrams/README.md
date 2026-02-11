# UniConvert - System Diagrams

This directory contains comprehensive technical diagrams for the UniConvert document conversion system.

## 📊 Available Diagrams

### 1. [System Architecture Diagram](./system-architecture.md)
**Purpose**: High-level overview of the entire system architecture

**Shows**:
- Client layer (React, Vite)
- Presentation layer (Components, Router, State)
- API layer (Axios, Services)
- Backend layer (Express, Middleware)
- Business logic layer (Controllers, Services)
- External tools (LibreOffice, Ghostscript, pdf-lib, pdfkit)
- Data layer (MongoDB, Mongoose)
- File system structure

**Use Case**: Understanding the overall system structure and component relationships

---

### 2. [Use Case Diagram](./use-case-diagram.md)
**Purpose**: Illustrates all user interactions and system functionalities

**Shows**:
- User actors (End User, System Admin)
- Primary use cases (Document conversions, PDF operations)
- File management operations
- System management tasks
- Relationships between use cases (includes, extends)

**Use Case**: Identifying functional requirements and user stories

---

### 3. [Data Flow Diagram - Level 0](./dfd-level-0.md)
**Purpose**: Context diagram showing the system as a single process

**Shows**:
- External entities (User, LibreOffice, Ghostscript, MongoDB, File System)
- Major data flows between entities and the system
- System boundary
- High-level inputs and outputs

**Use Case**: Understanding external dependencies and data exchange

---

### 4. [Data Flow Diagram - Level 1](./dfd-level-1.md)
**Purpose**: Detailed breakdown of internal processes and data flows

**Shows**:
- 6 main processes:
  1. File Upload Handler
  2. Conversion Manager
  3. File Processor
  4. History Manager
  5. Download Handler
  6. Cleanup Service
- 3 data stores (Upload Queue, Conversion Records, File Metadata)
- Detailed data flows between processes
- Integration with external tools

**Use Case**: Understanding internal system operations and data movement

---

### 5. [Database ER Diagram](./er-diagram.md)
**Purpose**: Database schema and entity relationships

**Shows**:
- 4 main entities:
  - **CONVERSION**: Conversion operation records
  - **FILE_METADATA**: File information and metadata
  - **CONVERSION_STATS**: Aggregated statistics
  - **SYSTEM_CONFIG**: System configuration
- Entity attributes with data types
- Relationships between entities
- Indexes for performance
- Sample data examples

**Use Case**: Database design, query optimization, and data modeling

---

### 6. [Sequence Diagram](./sequence-diagram.md)
**Purpose**: Step-by-step interaction flow for file conversion

**Shows**:
- Complete conversion process from upload to download
- Interactions between:
  - User
  - React Frontend
  - API Service
  - Express Server
  - Multer Middleware
  - Controllers
  - Services
  - External tools (LibreOffice)
  - File System
  - MongoDB
- Error handling flows
- Background cleanup process
- 41 detailed steps with timing

**Use Case**: Understanding the complete request-response cycle and debugging

---

### 7. [Activity Diagram](./activity-diagram.md)
**Purpose**: Workflow and decision logic for conversion operations

**Shows**:
- Complete user workflow from start to finish
- Decision points (file validation, conversion type, success checks)
- Parallel processes (main workflow + cleanup)
- Error handling paths
- User action choices
- Background cleanup cron job

**Use Case**: Understanding business logic, workflow optimization, and testing scenarios

---

## 🎨 Diagram Format

All diagrams are created using **Mermaid** syntax, which can be rendered in:
- GitHub (native support)
- VS Code (with Mermaid extension)
- Markdown preview tools
- Documentation sites (GitBook, Docusaurus, etc.)

## 📖 How to View

### Option 1: GitHub
Simply view the `.md` files on GitHub - diagrams will render automatically.

### Option 2: VS Code
1. Install the "Markdown Preview Mermaid Support" extension
2. Open any diagram file
3. Press `Ctrl+Shift+V` (Windows) or `Cmd+Shift+V` (Mac) for preview

### Option 3: Online Mermaid Editor
1. Copy the mermaid code block
2. Paste into [Mermaid Live Editor](https://mermaid.live/)
3. View and export as PNG/SVG

## 🔄 Diagram Updates

When updating the system, ensure diagrams are kept in sync:
- **Architecture changes** → Update System Architecture
- **New features** → Update Use Case Diagram
- **Process changes** → Update DFD and Activity Diagrams
- **Database changes** → Update ER Diagram
- **API changes** → Update Sequence Diagram

## 📚 Documentation Structure

```
docs/
├── diagrams/
│   ├── README.md (this file)
│   ├── system-architecture.md
│   ├── use-case-diagram.md
│   ├── dfd-level-0.md
│   ├── dfd-level-1.md
│   ├── er-diagram.md
│   ├── sequence-diagram.md
│   └── activity-diagram.md
└── [other documentation]
```

## 🎯 Quick Reference

| Need to understand... | View this diagram |
|----------------------|-------------------|
| Overall system structure | System Architecture |
| What users can do | Use Case Diagram |
| External dependencies | DFD Level 0 |
| Internal processes | DFD Level 1 |
| Database design | ER Diagram |
| Request-response flow | Sequence Diagram |
| Business logic flow | Activity Diagram |

## 📝 Notes

- All diagrams are based on the current implementation (v1.0.0)
- Diagrams use color coding for better visualization
- Each diagram includes detailed descriptions and explanations
- Sample data and examples are provided where applicable

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0  
**Project**: UniConvert - Smart Document Converter

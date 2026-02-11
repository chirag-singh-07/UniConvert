# Sequence Diagram - File Conversion Process

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as API Service
    participant Server as Express Server
    participant Multer as Multer Middleware
    participant Controller as Conversion Controller
    participant Service as Conversion Service
    participant LibreOffice as LibreOffice CLI
    participant FileSystem as File System
    participant DB as MongoDB
    
    User->>Frontend: 1. Select conversion type
    Frontend->>User: 2. Show file uploader
    
    User->>Frontend: 3. Upload file (drag & drop)
    Frontend->>Frontend: 4. Validate file size (<10MB)
    
    alt File too large
        Frontend->>User: Error: File exceeds 10MB
    else File valid
        Frontend->>User: 5. Show file preview
        User->>Frontend: 6. Click "Convert Now"
        
        Frontend->>API: 7. POST /api/convert<br/>(FormData with file)
        API->>Server: 8. HTTP Request
        
        Server->>Multer: 9. Process multipart form
        Multer->>FileSystem: 10. Save to /uploads/
        FileSystem-->>Multer: 11. File path
        Multer-->>Server: 12. File metadata
        
        Server->>Controller: 13. handleConvert(req, res)
        Controller->>Controller: 14. Validate request
        
        alt Invalid request
            Controller-->>Server: Error response
            Server-->>API: 400 Bad Request
            API-->>Frontend: Error message
            Frontend->>User: Show error toast
        else Valid request
            Controller->>Service: 15. convertFile(file, type)
            
            Service->>Service: 16. Determine conversion method
            
            alt DOCX/PPT/Excel to PDF
                Service->>LibreOffice: 17. Execute soffice command
                LibreOffice->>LibreOffice: 18. Convert document
                LibreOffice->>FileSystem: 19. Save to /converted/
                FileSystem-->>LibreOffice: 20. Success
                LibreOffice-->>Service: 21. Conversion complete
                
            else PDF to DOCX
                Service->>LibreOffice: Execute reverse conversion
                LibreOffice-->>Service: Conversion complete
                
            else Image to PDF
                Service->>Service: Use pdfkit library
                Service->>FileSystem: Save PDF
                
            else Merge PDFs
                Service->>Service: Use pdf-lib
                Service->>FileSystem: Save merged PDF
                
            else Compress PDF
                Service->>Service: Use Ghostscript
                Service->>FileSystem: Save compressed PDF
            end
            
            Service->>Service: 22. Calculate file sizes
            Service->>Service: 23. Calculate compression ratio
            
            Service->>DB: 24. Create conversion record
            DB-->>Service: 25. Record saved
            
            Service-->>Controller: 26. Conversion result
            Controller->>Controller: 27. Format response
            
            Controller-->>Server: 28. Success response
            Server-->>API: 29. 200 OK with data
            API-->>Frontend: 30. Conversion result
            
            Frontend->>Frontend: 31. Update UI state
            Frontend->>User: 32. Show download card
            
            User->>Frontend: 33. Click "Download"
            Frontend->>API: 34. GET /api/download/:filename
            API->>Server: 35. HTTP Request
            Server->>FileSystem: 36. Read file
            FileSystem-->>Server: 37. File stream
            Server->>DB: 38. Increment download count
            Server-->>API: 39. File download
            API-->>Frontend: 40. File blob
            Frontend->>User: 41. Browser download
        end
    end
    
    Note over FileSystem,DB: Cleanup Service (runs hourly)
    loop Every hour
        Service->>DB: Check files older than 1 hour
        DB-->>Service: List of expired files
        Service->>FileSystem: Delete expired files
        Service->>DB: Update records
    end
```

## Sequence Flow Description

### Phase 1: File Selection and Upload (Steps 1-12)
1. User selects the desired conversion type from the UI
2. Frontend displays the file uploader component
3. User uploads a file via drag-and-drop or file browser
4. Frontend validates file size (must be ≤ 10MB)
5. If valid, frontend shows file preview with name and size
6. User clicks "Convert Now" button
7. Frontend sends POST request to `/api/convert` with FormData
8. API service forwards the HTTP request to Express server
9. Server passes request through Multer middleware
10. Multer saves the uploaded file to `/uploads/` directory
11. File system returns the file path
12. Multer returns file metadata to the server

### Phase 2: Validation and Processing (Steps 13-21)
13. Server routes request to Conversion Controller
14. Controller validates the request (file type, conversion type)
15. Controller calls Conversion Service with file and type
16. Service determines the appropriate conversion method
17-21. Based on conversion type:
   - **Document conversion**: Calls LibreOffice CLI
   - **PDF to DOCX**: Uses LibreOffice reverse conversion
   - **Image to PDF**: Uses pdfkit library
   - **Merge PDFs**: Uses pdf-lib library
   - **Compress PDF**: Uses Ghostscript

### Phase 3: Result Processing (Steps 22-32)
22. Service calculates original and converted file sizes
23. Service calculates compression ratio (if applicable)
24. Service creates a conversion record in MongoDB
25. Database confirms record saved
26. Service returns conversion result to controller
27. Controller formats the response data
28. Controller sends success response to server
29. Server returns 200 OK with conversion data
30. API service receives the result
31. Frontend updates UI state with result
32. Frontend displays download card with file information

### Phase 4: File Download (Steps 33-41)
33. User clicks the "Download" button
34. Frontend sends GET request to `/api/download/:filename`
35. API forwards request to server
36. Server reads the file from file system
37. File system returns file stream
38. Server increments download count in database
39. Server streams file to API
40. API receives file blob
41. Browser initiates file download for user

### Background Process: Automated Cleanup
- **Frequency**: Runs every hour via cron job
- **Process**:
  1. Service queries database for files older than 1 hour
  2. Database returns list of expired files
  3. Service deletes files from file system
  4. Service updates database records to mark files as deleted

## Error Handling

### Client-Side Errors
- File size exceeds 10MB → Show error toast
- Invalid file type → Show error toast
- Network error → Show error toast

### Server-Side Errors
- Invalid request → 400 Bad Request
- Conversion failure → 500 Internal Server Error
- File not found → 404 Not Found
- Database error → 500 Internal Server Error

## Performance Considerations
- Async file processing prevents blocking
- Progress updates via frontend state management
- File streaming for large downloads
- Automated cleanup prevents disk space issues

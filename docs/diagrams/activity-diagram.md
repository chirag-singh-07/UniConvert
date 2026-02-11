# Activity Diagram - Conversion Workflow

```mermaid
flowchart TD
    Start([User Opens Application]) --> SelectType[Select Conversion Type]
    
    SelectType --> UploadFile[Upload File]
    
    UploadFile --> ValidateSize{File Size<br/>≤ 10MB?}
    
    ValidateSize -->|No| ShowSizeError[Show Error:<br/>File Too Large]
    ShowSizeError --> UploadFile
    
    ValidateSize -->|Yes| ValidateType{Valid File<br/>Type?}
    
    ValidateType -->|No| ShowTypeError[Show Error:<br/>Invalid File Type]
    ShowTypeError --> UploadFile
    
    ValidateType -->|Yes| ShowPreview[Display File Preview]
    
    ShowPreview --> UserConfirm{User Clicks<br/>Convert?}
    
    UserConfirm -->|Cancel| SelectType
    
    UserConfirm -->|Convert| CheckCompression{Compression<br/>Type?}
    
    CheckCompression -->|Yes| SelectLevel[Select Compression Level:<br/>Low/Medium/High]
    SelectLevel --> SendRequest
    
    CheckCompression -->|No| SendRequest[Send Conversion Request<br/>to Backend]
    
    SendRequest --> SaveUpload[Save File to<br/>/uploads/ Directory]
    
    SaveUpload --> DetermineType{Determine<br/>Conversion Type}
    
    DetermineType -->|DOCX/PPT/Excel<br/>to PDF| LibreOfficeConvert[Execute LibreOffice<br/>Conversion]
    
    DetermineType -->|PDF to DOCX| LibreOfficeReverse[Execute LibreOffice<br/>Reverse Conversion]
    
    DetermineType -->|Image to PDF| ImageConvert[Convert Image<br/>using pdfkit]
    
    DetermineType -->|Merge PDFs| MergePDF[Merge PDFs<br/>using pdf-lib]
    
    DetermineType -->|Compress PDF| CompressPDF[Compress PDF<br/>using Ghostscript]
    
    LibreOfficeConvert --> CheckSuccess
    LibreOfficeReverse --> CheckSuccess
    ImageConvert --> CheckSuccess
    MergePDF --> CheckSuccess
    CompressPDF --> CheckSuccess
    
    CheckSuccess{Conversion<br/>Successful?}
    
    CheckSuccess -->|No| LogError[Log Error Details]
    LogError --> ShowConversionError[Show Error Message<br/>to User]
    ShowConversionError --> Cleanup1[Delete Uploaded File]
    Cleanup1 --> End1([End])
    
    CheckSuccess -->|Yes| SaveConverted[Save Converted File<br/>to /converted/]
    
    SaveConverted --> CalculateStats[Calculate:<br/>- File Sizes<br/>- Compression Ratio<br/>- Timestamps]
    
    CalculateStats --> SaveDB[Save Conversion Record<br/>to MongoDB]
    
    SaveDB --> SetExpiry[Set Expiry Time<br/>Current Time + 1 Hour]
    
    SetExpiry --> ReturnResult[Return Conversion Result<br/>to Frontend]
    
    ReturnResult --> DisplayDownload[Display Download Card<br/>with File Info]
    
    DisplayDownload --> UserAction{User Action}
    
    UserAction -->|Download| DownloadFile[Download Converted File]
    DownloadFile --> IncrementCount[Increment Download Count<br/>in Database]
    IncrementCount --> UserAction2{Continue?}
    
    UserAction -->|Convert Another| SelectType
    
    UserAction -->|View History| ShowHistory[Display Conversion<br/>History]
    ShowHistory --> UserAction
    
    UserAction2 -->|Yes| UserAction
    UserAction2 -->|No| End2([End])
    
    subgraph "Background Cleanup Process"
        CronStart([Cron Job Triggered<br/>Every Hour]) --> QueryExpired[Query Files with<br/>expiresAt < Current Time]
        
        QueryExpired --> HasExpired{Expired Files<br/>Found?}
        
        HasExpired -->|No| CronEnd([Wait for Next Run])
        
        HasExpired -->|Yes| DeleteLoop[For Each Expired File]
        
        DeleteLoop --> DeleteFile[Delete File from<br/>File System]
        
        DeleteFile --> UpdateDB[Update Database:<br/>Mark as Deleted]
        
        UpdateDB --> MoreFiles{More Files<br/>to Delete?}
        
        MoreFiles -->|Yes| DeleteLoop
        MoreFiles -->|No| LogCleanup[Log Cleanup Summary]
        LogCleanup --> CronEnd
    end
    
    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#c8e6c9
    style ValidateSize fill:#fff9c4
    style ValidateType fill:#fff9c4
    style CheckSuccess fill:#fff9c4
    style UserConfirm fill:#fff9c4
    style CheckCompression fill:#fff9c4
    style DetermineType fill:#ffecb3
    style LibreOfficeConvert fill:#ffccbc
    style LibreOfficeReverse fill:#ffccbc
    style ImageConvert fill:#ffccbc
    style MergePDF fill:#ffccbc
    style CompressPDF fill:#ffccbc
    style SaveDB fill:#c8e6c9
    style CronStart fill:#d1c4e9
    style CronEnd fill:#d1c4e9
```

## Activity Flow Description

### Main Conversion Workflow

#### 1. Initialization Phase
- **Start**: User opens the UniConvert application
- **Select Conversion Type**: User chooses from available conversion options:
  - DOCX to PDF
  - PDF to DOCX
  - PPT to PDF
  - Excel to PDF
  - Image to PDF
  - Merge PDFs
  - Compress PDF

#### 2. File Upload Phase
- **Upload File**: User uploads file via drag-and-drop or file browser
- **Validate Size**: System checks if file size ≤ 10MB
  - If **No**: Show error message, return to upload
  - If **Yes**: Proceed to type validation
- **Validate Type**: System checks if file type matches conversion type
  - If **No**: Show error message, return to upload
  - If **Yes**: Show file preview

#### 3. Confirmation Phase
- **Show Preview**: Display file name, size, and type
- **User Confirms**: User decides to convert or cancel
  - If **Cancel**: Return to conversion type selection
  - If **Convert**: Proceed to conversion

#### 4. Compression Selection (Conditional)
- **Check Compression**: If conversion type is "Compress PDF"
  - **Yes**: User selects compression level (Low/Medium/High)
  - **No**: Skip to send request

#### 5. Backend Processing Phase
- **Send Request**: Frontend sends conversion request to backend
- **Save Upload**: Backend saves file to `/uploads/` directory
- **Determine Type**: System routes to appropriate conversion method

#### 6. Conversion Execution
Based on conversion type, execute one of:
- **LibreOffice Convert**: For DOCX/PPT/Excel → PDF
- **LibreOffice Reverse**: For PDF → DOCX
- **Image Convert**: For JPG/PNG → PDF (using pdfkit)
- **Merge PDF**: For combining multiple PDFs (using pdf-lib)
- **Compress PDF**: For reducing PDF size (using Ghostscript)

#### 7. Result Handling
- **Check Success**: Verify conversion completed successfully
  - If **No**: 
    - Log error details
    - Show error message to user
    - Delete uploaded file
    - End process
  - If **Yes**: Continue to save result

#### 8. Post-Conversion Processing
- **Save Converted**: Store converted file in `/converted/` directory
- **Calculate Stats**: Compute file sizes, compression ratio, timestamps
- **Save to Database**: Create conversion record in MongoDB
- **Set Expiry**: Set deletion time to current time + 1 hour
- **Return Result**: Send conversion data to frontend

#### 9. User Interaction Phase
- **Display Download**: Show download card with file information
- **User Action**: User can choose to:
  - **Download**: Download the converted file
    - Increment download count in database
    - Return to user actions
  - **Convert Another**: Start new conversion
  - **View History**: See past conversions

### Background Cleanup Process

#### Automated File Cleanup (Runs Every Hour)
1. **Cron Job Triggered**: Scheduled task starts
2. **Query Expired**: Find files where `expiresAt < current time`
3. **Check Expired Files**: Determine if any files need deletion
   - If **No**: Wait for next scheduled run
   - If **Yes**: Proceed to deletion loop
4. **Delete Loop**: For each expired file:
   - Delete file from file system
   - Update database to mark as deleted
   - Check if more files exist
5. **Log Cleanup**: Record cleanup summary
6. **End**: Wait for next scheduled run

## Decision Points

### Critical Decisions
1. **File Size Validation**: Prevents server overload
2. **File Type Validation**: Ensures compatible conversions
3. **Conversion Success Check**: Handles errors gracefully
4. **User Action Choice**: Provides flexible workflow

### Error Handling
- **Size Error**: User-friendly message, allow retry
- **Type Error**: Clear indication of accepted formats
- **Conversion Error**: Detailed error logging, cleanup of partial files

## Parallel Activities
- **Main Workflow**: User-initiated conversions
- **Cleanup Process**: Background cron job (independent)

## Performance Optimizations
- Async file processing
- Immediate user feedback
- Automated resource cleanup
- Database indexing for quick queries

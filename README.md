# College Chatbot

## Description

A smart AI-powered chatbot designed specifically for college students and staff, providing instant access to information about courses, events, campus facilities, administrative processes, exams, and more. The chatbot integrates real-time updates from the college website and internal databases to deliver accurate and up-to-date information.

## Features

### Core Functionality
- **Instant Query Response**: Provides immediate answers to queries about:
  - Course information and schedules
  - Campus events and activities
  - Hostel menus and facilities
  - Exam preparation resources
  - Administrative processes
  - Campus facilities and locations

- **Document Access**: 
  - PDF downloads of previous year question papers
  - Study materials and resources
  - Administrative forms and documents

- **Natural Language Processing**:
  - AI/NLP powered understanding of user queries
  - Contextual responses
  - Multi-turn conversations
  - Intent recognition

- **Real-time Updates**:
  - Web scraping for latest information
  - Database synchronization
  - Event notifications
  - Schedule updates

### User Management
- Student query interface
- Staff administrative panel
- Event and schedule updates
- Content management system

### Customization
- Generalizable architecture for any website
- Custom document integration
- Configurable knowledge base
- Adaptable to different institutions

## Technologies Used

### Backend
- **Python** - Core programming language
- **FastAPI** - Modern web framework for API development
- **LangChain** - LLM orchestration and chain management
- **OpenAI APIs** - Natural language understanding and generation

### Data Collection
- **Crawl4AI** - Advanced web scraping and content extraction
- **BeautifulSoup** - HTML parsing
- **Requests** - HTTP client

### Database
- **MySQL / SQLite** - Relational database for structured data
- **Vector Database** (optional) - For semantic search capabilities

### AI/ML
- **OpenAI GPT** - Language model for responses
- **Embeddings** - For semantic search
- **RAG (Retrieval Augmented Generation)** - For accurate responses

## Getting Started

### Prerequisites

- Python 3.9+
- MySQL or SQLite
- OpenAI API key

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
COLLEGE_WEBSITE_URL=your_college_website
```

### Running the Application

```bash
# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Usage

### For Students
- Ask questions about courses, exams, events
- Download previous year papers
- Get hostel menu information
- Query campus facilities
- Access administrative information

### For Staff
- Update event schedules
- Manage course information
- Upload documents
- Monitor chatbot usage
- Update knowledge base

## Deployment Options

- **College Intranet**: Secure internal deployment
- **Public Portal**: External access for prospective students
- **Mobile App Integration**: API endpoints for mobile applications
- **Web Widget**: Embeddable chat widget for college website

## Generalization

This project can be easily adapted for any institution or website:

1. **Provide Website URLs**: Configure the target website(s)
2. **Upload Documents**: Add relevant PDFs and documents
3. **Configure Knowledge Base**: Customize the information domain
4. **Deploy**: Launch the customized chatbot

## API Endpoints

```
GET  /api/health              - Health check
POST /api/chat                - Send message to chatbot
GET  /api/documents           - List available documents
GET  /api/documents/{id}      - Download specific document
POST /api/admin/update        - Update knowledge base (admin)
GET  /api/events              - Get upcoming events
```

## Architecture

```
User Query
    ↓
FastAPI Endpoint
    ↓
LangChain Processing
    ↓
RAG Pipeline (Retrieval + Generation)
    ↓
Database/Web Scraping
    ↓
OpenAI LLM
    ↓
Response to User
```

## Features in Detail

### Web Scraping
- Automated content extraction from college website
- Schedule synchronization
- Event updates
- News and announcements

### Document Management
- PDF storage and retrieval
- Categorization by subject/year
- Search functionality
- Version control

### Conversation Management
- Context retention
- Multi-turn dialogues
- Follow-up questions
- Clarification requests

## Future Enhancements

- Voice interface integration
- Multi-language support
- Personalized recommendations
- Analytics dashboard
- Mobile application
- Integration with college ERP systems

## License

This project is licensed under the terms specified in the LICENSE file.

## Contributing

Contributions are welcome! This project can be extended to support:
- Additional data sources
- New features
- UI improvements
- Performance optimizations

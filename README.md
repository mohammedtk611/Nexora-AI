# Revamp AI — SIH 2026

GenAI Platform for Automated Cybersecurity Intelligence & Content Transformation

Smart India Hackathon 2026 · Problem Statement 26154 · NTRO/NCIIPC

Revamp AI is a multimodal, RAG-grounded and agentic AI platform that converts raw cybersecurity intelligence into consistent, audience-specific communication artifacts such as executive briefs, security advisories, social campaigns, presentations, infographics and video packages.

## 🎯 Problem & Solution

Cybersecurity analysts often need to manually transform the same intelligence into multiple formats for different audiences. Revamp AI provides a unified pipeline:

```
Cybersecurity Input
       ↓
Multimodal Ingestion
       ↓
Normalization & Central Context
       ↓
Cybersecurity RAG
       ↓
Agentic Transformation
       ↓
Validation & Guardrails
       ↓
Multiple Communication Artifacts
```

The shared central context acts as the source of truth, helping maintain factual consistency across all generated outputs.

## 🚀 Key Capabilities

### 1. Multimodal Intelligence Ingestion
Supports:
- PDF, DOCX, TXT
- PNG, JPG
- MP3, MP4
- Web URLs
- Raw text

### 2. Cybersecurity RAG
Retrieves relevant domain knowledge from a vector knowledge base containing resources such as:
- MITRE ATT&CK
- NIST
- Security advisory templates
- Organization-specific knowledge

### 3. Specialized AI Agents
| Agent | Output |
| :--- | :--- |
| **Executive Brief** | Executive-level risk, impact & actions |
| **Security Advisory** | Technical advisory with indicators & mitigation |
| **Social Campaign** | LinkedIn & X/Twitter content |
| **Presentation** | Editable PPTX |
| **Infographic** | Structured visual data |
| **Video Package** | Script, storyboard, MP3 & SRT |

### 4. Configurable Transformation
Users can control:
- Target audience
- Tone
- Objective
- Severity
- Language
- Output formats

### 5. Validation & Guardrails
The pipeline validates:
- Source grounding
- Cross-output consistency
- Severity consistency
- PII handling
- Output structure

## 🏗️ Architecture

```
                    User
                     │
                     ▼
              React Frontend
                     │
                     ▼
                 FastAPI
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    PostgreSQL     Redis        Storage
                     │
                   Celery
                     │
                     ▼
                 LangGraph
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Ingestion        RAG       AI Agents
       │             │             │
       │           Qdrant          │
       │                           │
       └─────────────┬─────────────┘
                     ▼
             Guardrails
                     │
                     ▼
              Artifact Renderers
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        PDF        PPTX      Video/Audio
                     │
                     ▼
              Preview / Download
```

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Python 3.11
- FastAPI
- PostgreSQL
- SQLAlchemy
- Redis
- Celery

### AI & RAG
- LangGraph
- LangChain
- Gemini 2.5 Flash
- Ollama / Llama 3.1 8B
- Qdrant
- Sentence Transformers

### Multimodal Processing
- PyMuPDF
- python-docx
- Tesseract OCR
- Faster-Whisper
- BeautifulSoup

### Artifact Generation
- python-pptx
- WeasyPrint
- Edge-TTS
- SVG
- SRT

## 🔄 Transformation Flow

```
1. Upload intelligence
        ↓
2. Parse & normalize
        ↓
3. Extract facts and context
        ↓
4. Retrieve relevant knowledge
        ↓
5. Route to specialized agents
        ↓
6. Generate selected outputs
        ↓
7. Validate & apply guardrails
        ↓
8. Render artifacts
        ↓
9. Preview & download
```

## 📦 Supported Outputs
- ✓ Executive Brief
- ✓ Security Advisory PDF
- ✓ LinkedIn / X Campaign
- ✓ Editable PPTX
- ✓ Infographic / SVG
- ✓ Video Script
- ✓ TTS Narration MP3
- ✓ SRT Subtitles
- ✓ Video Package ZIP

## 🔌 API

The frontend communicates exclusively with the FastAPI backend.

- `/api/v1/auth`
- `/api/v1/projects`
- `/api/v1/ingestion`
- `/api/v1/transformations`
- `/api/v1/jobs`
- `/api/v1/artifacts`
- `/api/v1/knowledge-base`
- `/api/v1/audit`
- `/api/v1/settings`

API documentation: `http://localhost:8000/docs`

## ⚙️ Quick Start

### 1. Clone
```bash
git clone https://github.com/PurvaBhadange/Revamp-AI.git
cd Revamp-AI
```

### 2. Configure
```bash
cp .env.example .env
```
Add the required API keys and local service configuration.

### 3. Start infrastructure
```bash
docker-compose up -d
```

### 4. Start backend
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Start Celery
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

## 🧪 Testing

Run automated tests:
```bash
python -m pytest tests -v
```

The E2E workflow covers:
Authentication → Upload → Ingestion → Context → RAG → Agent Execution → Artifact Generation → Validation → Preview → Download

## 🔐 Security

Revamp AI includes:
- JWT authentication
- Secure password hashing
- Input & MIME validation
- Path-traversal protection
- Environment-based secrets
- Audit logging
- Source-grounding checks
- PII handling
- Controlled error responses

Never commit `.env`, API keys or database credentials.

## 🎯 SIH 2026

- **Problem Statement**: 26154
- **Organization**: NTRO / NCIIPC
- **Domain**: Cybersecurity & Generative AI
- **Solution**: Revamp AI
- **Architecture**: Multimodal + RAG + Multi-Agent

*One intelligence source. One central context. Multiple consistent communication outputs.*

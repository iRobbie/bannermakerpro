from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Image Models
class ImageUpload(BaseModel):
    name: str
    size: int
    content_type: str
    data: str  # base64 encoded image data

class ImageResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    size: int
    content_type: str
    url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Text Overlay Models
class TextStyle(BaseModel):
    font_size: int = 24
    font_family: str = "Arial"
    color: str = "#000000"
    font_weight: str = "normal"
    font_style: str = "normal"
    text_align: str = "left"
    background_color: str = "transparent"
    padding: int = 10
    border_radius: int = 0

class TextPosition(BaseModel):
    x: float = 50
    y: float = 50

class TextOverlay(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    style: TextStyle
    position: TextPosition

# Grid Size Model
class GridSize(BaseModel):
    rows: int = Field(ge=1, le=6)
    cols: int = Field(ge=1, le=6)

# Export Settings Model
class ExportSettings(BaseModel):
    format: str = Field(default="png", regex="^(png|jpg)$")
    quality: int = Field(default=90, ge=10, le=100)
    resolution: str = Field(default="2K", regex="^(1080p|2K|4K)$")

# Project Models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None  # List of image IDs
    grid_size: Optional[GridSize] = None
    background_color: Optional[str] = None
    text_overlays: Optional[List[TextOverlay]] = None
    export_settings: Optional[ExportSettings] = None

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    images: List[str] = []  # List of image IDs
    grid_size: GridSize = GridSize(rows=2, cols=2)
    background_color: str = "#ffffff"
    text_overlays: List[TextOverlay] = []
    export_settings: ExportSettings = ExportSettings()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_session: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    images: List[ImageResponse] = []  # Full image objects
    grid_size: GridSize
    background_color: str
    text_overlays: List[TextOverlay]
    export_settings: ExportSettings
    created_at: datetime
    updated_at: datetime

# Session Models
class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)

# Response Models
class StatusResponse(BaseModel):
    status: str
    message: str

class UploadResponse(BaseModel):
    images: List[ImageResponse]
    message: str

class ExportResponse(BaseModel):
    export_url: str
    format: str
    resolution: str
    file_size_mb: float
    message: str
import base64
import os
from typing import Tuple, Optional
from pathlib import Path
import uuid
from datetime import datetime
import magic

# File storage directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class FileManager:
    ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    @staticmethod
    def validate_image(content_type: str, file_size: int) -> Tuple[bool, str]:
        """Validate image file"""
        if file_size > FileManager.MAX_FILE_SIZE:
            return False, f"File size {file_size} bytes exceeds maximum of {FileManager.MAX_FILE_SIZE} bytes"
        
        allowed_types = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 
            'image/gif', 'image/bmp'
        ]
        
        if content_type not in allowed_types:
            return False, f"Content type {content_type} not allowed. Allowed types: {allowed_types}"
        
        return True, "Valid"
    
    @staticmethod
    def save_base64_image(base64_data: str, filename: str, content_type: str) -> Tuple[bool, str, Optional[str]]:
        """Save base64 encoded image to disk"""
        try:
            # Remove data URL prefix if present
            if base64_data.startswith('data:'):
                base64_data = base64_data.split(',')[1]
            
            # Decode base64 data
            image_data = base64.b64decode(base64_data)
            
            # Validate file size
            is_valid, message = FileManager.validate_image(content_type, len(image_data))
            if not is_valid:
                return False, message, None
            
            # Generate unique filename
            file_extension = FileManager.get_extension_from_content_type(content_type)
            unique_filename = f"{uuid.uuid4()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(image_data)
            
            # Generate URL (relative path)
            file_url = f"/api/files/{unique_filename}"
            
            return True, "File saved successfully", file_url
            
        except Exception as e:
            return False, f"Error saving file: {str(e)}", None
    
    @staticmethod
    def get_extension_from_content_type(content_type: str) -> str:
        """Get file extension from content type"""
        type_map = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'image/bmp': '.bmp'
        }
        return type_map.get(content_type, '.jpg')
    
    @staticmethod
    def get_file_path(filename: str) -> Optional[Path]:
        """Get full path to uploaded file"""
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            return file_path
        return None
    
    @staticmethod
    def delete_file(filename: str) -> bool:
        """Delete uploaded file"""
        try:
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    @staticmethod
    def get_file_info(file_path: Path) -> dict:
        """Get file information"""
        try:
            stat = file_path.stat()
            return {
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime),
                'modified': datetime.fromtimestamp(stat.st_mtime),
                'content_type': magic.from_file(str(file_path), mime=True)
            }
        except Exception:
            return {}
    
    @staticmethod
    def convert_to_base64(file_path: Path) -> Optional[str]:
        """Convert file to base64"""
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
                return base64.b64encode(file_data).decode('utf-8')
        except Exception:
            return None
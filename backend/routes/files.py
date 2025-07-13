from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from file_utils import FileManager
import os

router = APIRouter(prefix="/files", tags=["files"])

@router.get("/{filename}")
async def serve_file(filename: str):
    """Serve uploaded files"""
    try:
        file_path = FileManager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get file info to determine content type
        file_info = FileManager.get_file_info(file_path)
        content_type = file_info.get('content_type', 'application/octet-stream')
        
        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")
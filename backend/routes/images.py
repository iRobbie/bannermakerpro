from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List
from models import ImageUpload, ImageResponse, UploadResponse, StatusResponse
from database import DatabaseManager
from file_utils import FileManager
import json
import base64

router = APIRouter(prefix="/images", tags=["images"])

@router.post("/upload", response_model=UploadResponse)
async def upload_images(images_data: str = Form(...)):
    """Upload multiple images via base64 encoded data"""
    try:
        # Parse the JSON data
        images_list = json.loads(images_data)
        uploaded_images = []
        
        for image_data in images_list:
            # Validate required fields
            if not all(key in image_data for key in ['name', 'size', 'content_type', 'data']):
                raise HTTPException(status_code=400, detail="Missing required image fields")
            
            # Create ImageUpload model
            image_upload = ImageUpload(**image_data)
            
            # Validate and save file
            success, message, file_url = FileManager.save_base64_image(
                image_upload.data, 
                image_upload.name, 
                image_upload.content_type
            )
            
            if not success:
                raise HTTPException(status_code=400, detail=message)
            
            # Create image record in database
            image_response = ImageResponse(
                name=image_upload.name,
                size=image_upload.size,
                content_type=image_upload.content_type,
                url=file_url
            )
            
            saved_image = await DatabaseManager.create_image(image_response)
            uploaded_images.append(saved_image)
        
        return UploadResponse(
            images=uploaded_images,
            message=f"Successfully uploaded {len(uploaded_images)} images"
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading images: {str(e)}")

@router.post("/upload-files", response_model=UploadResponse)
async def upload_image_files(files: List[UploadFile] = File(...)):
    """Upload multiple image files"""
    try:
        uploaded_images = []
        
        for file in files:
            # Read file content
            file_content = await file.read()
            
            # Validate file
            is_valid, message = FileManager.validate_image(file.content_type, len(file_content))
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"Invalid file {file.filename}: {message}")
            
            # Convert to base64
            base64_data = base64.b64encode(file_content).decode('utf-8')
            
            # Save file
            success, save_message, file_url = FileManager.save_base64_image(
                base64_data, 
                file.filename, 
                file.content_type
            )
            
            if not success:
                raise HTTPException(status_code=400, detail=f"Error saving {file.filename}: {save_message}")
            
            # Create image record
            image_response = ImageResponse(
                name=file.filename,
                size=len(file_content),
                content_type=file.content_type,
                url=file_url
            )
            
            saved_image = await DatabaseManager.create_image(image_response)
            uploaded_images.append(saved_image)
        
        return UploadResponse(
            images=uploaded_images,
            message=f"Successfully uploaded {len(uploaded_images)} files"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")

@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(image_id: str):
    """Get image metadata by ID"""
    try:
        image = await DatabaseManager.get_image(image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return image
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching image: {str(e)}")

@router.get("/", response_model=List[ImageResponse])
async def get_images():
    """Get all images for current session"""
    try:
        # For now, get recent images from all projects
        # In production, this would be filtered by session
        session_id = "default_session"
        images = await DatabaseManager.get_images_by_session(session_id)
        
        return images
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching images: {str(e)}")

@router.delete("/{image_id}", response_model=StatusResponse)
async def delete_image(image_id: str):
    """Delete an image"""
    try:
        # Get image first to get filename
        image = await DatabaseManager.get_image(image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Extract filename from URL
        filename = image.url.split('/')[-1] if image.url else None
        
        # Delete from database
        deleted = await DatabaseManager.delete_image(image_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Image not found in database")
        
        # Delete file from disk
        if filename:
            FileManager.delete_file(filename)
        
        return StatusResponse(status="success", message="Image deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")

@router.get("/{image_id}/download")
async def download_image(image_id: str):
    """Download image file"""
    try:
        # Get image metadata
        image = await DatabaseManager.get_image(image_id)
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Extract filename from URL
        filename = image.url.split('/')[-1] if image.url else None
        if not filename:
            raise HTTPException(status_code=404, detail="Image file not found")
        
        # Get file path
        file_path = FileManager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="Image file not found on disk")
        
        return FileResponse(
            path=file_path,
            filename=image.name,
            media_type=image.content_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading image: {str(e)}")
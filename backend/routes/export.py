from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from models import ExportResponse
from database import DatabaseManager
from file_utils import FileManager
import base64
import io
from PIL import Image, ImageDraw, ImageFont
import json
from datetime import datetime
import uuid
from pathlib import Path

router = APIRouter(prefix="/export", tags=["export"])

@router.post("/{project_id}/generate", response_model=ExportResponse)
async def generate_banner(project_id: str):
    """Generate and export banner for a project"""
    try:
        # Get project data
        project = await DatabaseManager.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get resolution settings
        resolution_map = {
            "1080p": (1920, 1080),
            "2K": (2048, 2048),
            "4K": (4096, 4096)
        }
        
        width, height = resolution_map.get(project.export_settings.resolution, (2048, 2048))
        
        # Create banner image
        banner_image = await create_banner_image(project, width, height)
        
        # Save banner to temporary file
        temp_filename = f"banner_{project_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{project.export_settings.format}"
        temp_path = Path("/app/backend/uploads") / temp_filename
        
        # Save with appropriate format and quality
        if project.export_settings.format == "jpg":
            banner_image.save(temp_path, "JPEG", quality=project.export_settings.quality, optimize=True)
        else:
            banner_image.save(temp_path, "PNG", optimize=True)
        
        # Get file size
        file_size_mb = temp_path.stat().st_size / (1024 * 1024)
        
        # Generate export URL
        export_url = f"/api/files/{temp_filename}"
        
        return ExportResponse(
            export_url=export_url,
            format=project.export_settings.format,
            resolution=project.export_settings.resolution,
            file_size_mb=round(file_size_mb, 2),
            message="Banner generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating banner: {str(e)}")

@router.get("/{project_id}/download")
async def download_banner(project_id: str):
    """Download the generated banner directly"""
    try:
        # Get project data
        project = await DatabaseManager.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get resolution settings
        resolution_map = {
            "1080p": (1920, 1080),
            "2K": (2048, 2048),
            "4K": (4096, 4096)
        }
        
        width, height = resolution_map.get(project.export_settings.resolution, (2048, 2048))
        
        # Create banner image
        banner_image = await create_banner_image(project, width, height)
        
        # Save to memory buffer
        img_buffer = io.BytesIO()
        
        if project.export_settings.format == "jpg":
            banner_image.save(img_buffer, "JPEG", quality=project.export_settings.quality, optimize=True)
            media_type = "image/jpeg"
        else:
            banner_image.save(img_buffer, "PNG", optimize=True)
            media_type = "image/png"
        
        img_buffer.seek(0)
        
        # Generate filename
        filename = f"{project.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{project.export_settings.format}"
        
        return StreamingResponse(
            io.BytesIO(img_buffer.read()),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading banner: {str(e)}")

async def create_banner_image(project, width: int, height: int) -> Image.Image:
    """Create the actual banner image from project data"""
    try:
        # Create base image with background color
        if project.background_color.startswith('#'):
            bg_color = project.background_color
        else:
            bg_color = '#ffffff'
        
        banner = Image.new('RGB', (width, height), bg_color)
        draw = ImageDraw.Draw(banner)
        
        # Calculate grid layout
        rows = project.grid_size.rows
        cols = project.grid_size.cols
        cell_width = width // cols
        cell_height = height // rows
        
        # Get and place images
        if project.images:
            images = await DatabaseManager.get_images(project.images)
            
            for i, image_data in enumerate(images[:rows * cols]):
                if i >= rows * cols:
                    break
                
                row = i // cols
                col = i % cols
                
                x = col * cell_width
                y = row * cell_height
                
                # Load image from file
                filename = image_data.url.split('/')[-1] if image_data.url else None
                if filename:
                    file_path = FileManager.get_file_path(filename)
                    if file_path and file_path.exists():
                        try:
                            img = Image.open(file_path)
                            
                            # Resize to fit cell while maintaining aspect ratio
                            img_ratio = img.width / img.height
                            cell_ratio = cell_width / cell_height
                            
                            if img_ratio > cell_ratio:
                                # Image is wider, fit to width
                                new_width = cell_width
                                new_height = int(cell_width / img_ratio)
                            else:
                                # Image is taller, fit to height
                                new_height = cell_height
                                new_width = int(cell_height * img_ratio)
                            
                            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                            
                            # Center image in cell
                            paste_x = x + (cell_width - new_width) // 2
                            paste_y = y + (cell_height - new_height) // 2
                            
                            # Handle transparency
                            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                                banner.paste(img, (paste_x, paste_y), img)
                            else:
                                banner.paste(img, (paste_x, paste_y))
                                
                        except Exception as e:
                            print(f"Error processing image {filename}: {e}")
                            continue
        
        # Add text overlays
        for overlay in project.text_overlays:
            try:
                # Scale text position and size relative to canvas size
                scale_x = width / 800  # Assuming original canvas was 800px wide
                scale_y = height / 800  # Assuming original canvas was 800px high
                
                x = int(overlay.position.x * scale_x)
                y = int(overlay.position.y * scale_y)
                font_size = int(overlay.style.font_size * min(scale_x, scale_y))
                
                # Try to load font (fallback to default if not available)
                try:
                    # You could add custom font loading here
                    font = ImageFont.load_default()
                except:
                    font = ImageFont.load_default()
                
                # Draw text
                text_color = overlay.style.color
                if text_color.startswith('#'):
                    draw.text((x, y), overlay.text, fill=text_color, font=font)
                
            except Exception as e:
                print(f"Error adding text overlay: {e}")
                continue
        
        return banner
        
    except Exception as e:
        raise Exception(f"Error creating banner image: {str(e)}")
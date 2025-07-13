from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import (
    Project, ProjectCreate, ProjectUpdate, ProjectResponse, 
    StatusResponse, ImageResponse
)
from database import DatabaseManager
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["projects"])

def get_session_id() -> str:
    """Get session ID from headers or create new one"""
    # For now, we'll use a simple session system
    # In production, this would be more sophisticated
    return "default_session"

@router.post("/", response_model=ProjectResponse)
async def create_project(project_create: ProjectCreate, session_id: str = Depends(get_session_id)):
    """Create a new banner project"""
    try:
        project = Project(
            name=project_create.name,
            description=project_create.description,
            user_session=session_id
        )
        
        created_project = await DatabaseManager.create_project(project)
        
        # Get project with images for response
        return await get_project_response(created_project.id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(session_id: str = Depends(get_session_id)):
    """Get all projects for current session"""
    try:
        projects = await DatabaseManager.get_projects_by_session(session_id)
        
        # Convert to response format with images
        project_responses = []
        for project in projects:
            project_response = await get_project_response(project.id)
            project_responses.append(project_response)
        
        return project_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching projects: {str(e)}")

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project by ID"""
    try:
        return await get_project_response(project_id)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project: {str(e)}")

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_update: ProjectUpdate):
    """Update a project"""
    try:
        # Get current project
        current_project = await DatabaseManager.get_project(project_id)
        if not current_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Prepare update data
        update_data = {}
        if project_update.name is not None:
            update_data["name"] = project_update.name
        if project_update.description is not None:
            update_data["description"] = project_update.description
        if project_update.images is not None:
            update_data["images"] = project_update.images
        if project_update.grid_size is not None:
            update_data["grid_size"] = project_update.grid_size.dict()
        if project_update.background_color is not None:
            update_data["background_color"] = project_update.background_color
        if project_update.text_overlays is not None:
            update_data["text_overlays"] = [overlay.dict() for overlay in project_update.text_overlays]
        if project_update.export_settings is not None:
            update_data["export_settings"] = project_update.export_settings.dict()
        
        # Update project
        updated_project = await DatabaseManager.update_project(project_id, update_data)
        if not updated_project:
            raise HTTPException(status_code=404, detail="Project not found or update failed")
        
        return await get_project_response(project_id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating project: {str(e)}")

@router.delete("/{project_id}", response_model=StatusResponse)
async def delete_project(project_id: str):
    """Delete a project"""
    try:
        deleted = await DatabaseManager.delete_project(project_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return StatusResponse(status="success", message="Project deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting project: {str(e)}")

@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project(project_id: str, session_id: str = Depends(get_session_id)):
    """Duplicate an existing project"""
    try:
        # Get original project
        original_project = await DatabaseManager.get_project(project_id)
        if not original_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create new project with same data
        new_project = Project(
            name=f"{original_project.name} (Copy)",
            description=original_project.description,
            images=original_project.images.copy(),
            grid_size=original_project.grid_size,
            background_color=original_project.background_color,
            text_overlays=original_project.text_overlays.copy(),
            export_settings=original_project.export_settings,
            user_session=session_id
        )
        
        created_project = await DatabaseManager.create_project(new_project)
        return await get_project_response(created_project.id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error duplicating project: {str(e)}")

async def get_project_response(project_id: str) -> ProjectResponse:
    """Helper function to get project with full image data"""
    project = await DatabaseManager.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get full image data
    images = []
    if project.images:
        images = await DatabaseManager.get_images(project.images)
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        images=images,
        grid_size=project.grid_size,
        background_color=project.background_color,
        text_overlays=project.text_overlays,
        export_settings=project.export_settings,
        created_at=project.created_at,
        updated_at=project.updated_at
    )
from motor.motor_asyncio import AsyncIOMotorClient
from models import Project, ImageResponse, UserSession
import os
from typing import List, Optional
from datetime import datetime

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
projects_collection = db.projects
images_collection = db.images
sessions_collection = db.sessions

class DatabaseManager:
    @staticmethod
    async def create_session() -> UserSession:
        """Create a new user session"""
        session = UserSession()
        await sessions_collection.insert_one(session.dict())
        return session
    
    @staticmethod
    async def get_session(session_id: str) -> Optional[UserSession]:
        """Get session by ID"""
        session_data = await sessions_collection.find_one({"session_id": session_id})
        if session_data:
            return UserSession(**session_data)
        return None
    
    @staticmethod
    async def update_session_access(session_id: str):
        """Update last accessed time for session"""
        await sessions_collection.update_one(
            {"session_id": session_id},
            {"$set": {"last_accessed": datetime.utcnow()}}
        )
    
    @staticmethod
    async def create_project(project: Project) -> Project:
        """Create a new project"""
        project_dict = project.dict()
        await projects_collection.insert_one(project_dict)
        return project
    
    @staticmethod
    async def get_project(project_id: str) -> Optional[Project]:
        """Get project by ID"""
        project_data = await projects_collection.find_one({"id": project_id})
        if project_data:
            return Project(**project_data)
        return None
    
    @staticmethod
    async def get_projects_by_session(session_id: str, limit: int = 50) -> List[Project]:
        """Get all projects for a session"""
        cursor = projects_collection.find({"user_session": session_id}).sort("updated_at", -1).limit(limit)
        projects = []
        async for project_data in cursor:
            projects.append(Project(**project_data))
        return projects
    
    @staticmethod
    async def update_project(project_id: str, update_data: dict) -> Optional[Project]:
        """Update a project"""
        update_data["updated_at"] = datetime.utcnow()
        result = await projects_collection.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
        if result.modified_count > 0:
            return await DatabaseManager.get_project(project_id)
        return None
    
    @staticmethod
    async def delete_project(project_id: str) -> bool:
        """Delete a project"""
        result = await projects_collection.delete_one({"id": project_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def create_image(image: ImageResponse) -> ImageResponse:
        """Create a new image record"""
        image_dict = image.dict()
        await images_collection.insert_one(image_dict)
        return image
    
    @staticmethod
    async def get_image(image_id: str) -> Optional[ImageResponse]:
        """Get image by ID"""
        image_data = await images_collection.find_one({"id": image_id})
        if image_data:
            return ImageResponse(**image_data)
        return None
    
    @staticmethod
    async def get_images(image_ids: List[str]) -> List[ImageResponse]:
        """Get multiple images by IDs"""
        cursor = images_collection.find({"id": {"$in": image_ids}})
        images = []
        async for image_data in cursor:
            images.append(ImageResponse(**image_data))
        return images
    
    @staticmethod
    async def delete_image(image_id: str) -> bool:
        """Delete an image"""
        result = await images_collection.delete_one({"id": image_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def get_images_by_session(session_id: str, limit: int = 100) -> List[ImageResponse]:
        """Get all images uploaded by a session"""
        # For now, we'll get images from projects associated with the session
        projects = await DatabaseManager.get_projects_by_session(session_id)
        all_image_ids = []
        for project in projects:
            all_image_ids.extend(project.images)
        
        if all_image_ids:
            return await DatabaseManager.get_images(list(set(all_image_ids)))
        return []
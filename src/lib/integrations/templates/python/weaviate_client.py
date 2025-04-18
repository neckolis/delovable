"""
Weaviate Client for Python

This file was automatically generated by Delovable to help you integrate
Weaviate vector database into your project.
"""

import weaviate
from weaviate.auth import AuthApiKey
from typing import Dict, List, Optional, Any
from datetime import datetime

class WeaviateClient:
    """
    A client for interacting with Weaviate vector database
    """
    
    def __init__(
        self,
        host: str = "your-cluster-id.weaviate.cloud",  # Replace with your Weaviate cluster
        api_key: Optional[str] = "your-api-key",       # Replace with your API key
        scheme: str = "https"
    ):
        """
        Initialize the Weaviate client
        
        Args:
            host: Weaviate host address
            api_key: API key for authentication
            scheme: Connection scheme (http or https)
        """
        auth_config = None
        if api_key:
            auth_config = AuthApiKey(api_key=api_key)
            
        self.client = weaviate.Client(
            url=f"{scheme}://{host}",
            auth_client_secret=auth_config
        )
        
    def create_document_schema(self) -> None:
        """
        Create a schema class for storing documents if it doesn't exist
        """
        # Check if the class already exists
        schema = self.client.schema.get()
        if schema and any(c['class'] == 'Document' for c in schema['classes']):
            print("Document class already exists")
            return
        
        # Define the Document class
        class_obj = {
            "class": "Document",
            "description": "A document with text content",
            "vectorizer": "text2vec-transformers",  # You can change this to your preferred vectorizer
            "properties": [
                {
                    "name": "title",
                    "dataType": ["text"],
                    "description": "The title of the document",
                },
                {
                    "name": "content",
                    "dataType": ["text"],
                    "description": "The content of the document",
                },
                {
                    "name": "category",
                    "dataType": ["text"],
                    "description": "The category of the document",
                },
                {
                    "name": "url",
                    "dataType": ["text"],
                    "description": "The URL of the document",
                },
                {
                    "name": "created_at",
                    "dataType": ["date"],
                    "description": "When the document was created",
                }
            ],
        }
        
        try:
            self.client.schema.create_class(class_obj)
            print("Created Document class successfully")
        except Exception as e:
            print(f"Error creating Document class: {e}")
            raise
    
    def add_document(
        self,
        title: str,
        content: str,
        category: str = "general",
        url: Optional[str] = None
    ) -> str:
        """
        Add a document to Weaviate
        
        Args:
            title: Document title
            content: Document content
            category: Document category
            url: Document URL
            
        Returns:
            The UUID of the created document
        """
        try:
            properties = {
                "title": title,
                "content": content,
                "category": category,
                "created_at": datetime.now().isoformat(),
            }
            
            if url:
                properties["url"] = url
                
            result = self.client.data_object.create(
                class_name="Document",
                data_object=properties
            )
            
            print(f"Added document successfully: {result}")
            return result
        except Exception as e:
            print(f"Error adding document: {e}")
            raise
    
    def search_documents(
        self,
        query: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for documents by semantic similarity
        
        Args:
            query: The search query
            limit: Maximum number of results to return
            
        Returns:
            A list of matching documents
        """
        try:
            result = (
                self.client.query
                .get("Document", ["title", "content", "category", "url", "created_at"])
                .with_near_text({"concepts": [query]})
                .with_limit(limit)
                .with_additional(["certainty"])
                .do()
            )
            
            if "data" in result and "Get" in result["data"] and "Document" in result["data"]["Get"]:
                return result["data"]["Get"]["Document"]
            return []
        except Exception as e:
            print(f"Error searching documents: {e}")
            raise

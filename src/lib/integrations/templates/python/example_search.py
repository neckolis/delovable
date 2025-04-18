"""
Example: Using Weaviate for semantic search

This file demonstrates how to use the Weaviate client to perform
semantic search on your data.
"""

from weaviate_client import WeaviateClient

def main():
    try:
        # Create a Weaviate client
        print("Creating Weaviate client...")
        client = WeaviateClient()
        
        # Create the Document schema if it doesn't exist
        print("Setting up Document schema...")
        client.create_document_schema()
        
        # Add some example documents
        print("Adding example documents...")
        documents = [
            {
                "title": "Introduction to Vector Databases",
                "content": "Vector databases store data as high-dimensional vectors, enabling semantic search and AI-powered applications.",
                "category": "database",
                "url": "https://example.com/vector-databases",
            },
            {
                "title": "Getting Started with Weaviate",
                "content": "Weaviate is an open-source vector database that allows you to store data objects and vector embeddings.",
                "category": "tutorial",
                "url": "https://example.com/weaviate-tutorial",
            },
            {
                "title": "Building AI-Powered Search",
                "content": "Semantic search uses AI to understand the meaning behind search queries, providing more relevant results.",
                "category": "ai",
                "url": "https://example.com/ai-search",
            },
        ]
        
        for doc in documents:
            client.add_document(
                title=doc["title"],
                content=doc["content"],
                category=doc["category"],
                url=doc["url"]
            )
        
        # Perform a semantic search
        print("Performing semantic search...")
        search_query = "How do vector databases work?"
        search_results = client.search_documents(search_query)
        
        print(f'Search results for: "{search_query}"')
        for i, result in enumerate(search_results):
            certainty = result["_additional"]["certainty"] * 100
            print(f"\nResult {i + 1} (Certainty: {certainty:.2f}%):")
            print(f"Title: {result['title']}")
            print(f"Category: {result['category']}")
            print(f"Content: {result['content'][:100]}...")
        
    except Exception as e:
        print(f"Error in Weaviate example: {e}")

if __name__ == "__main__":
    main()

"""
Next steps:

1. Replace the default configuration in weaviate_client.py with your Weaviate cluster details
2. Install the Weaviate client: pip install weaviate-client
3. Run this example: python example_search.py

Learn more about Weaviate at: https://weaviate.io/developers/weaviate
"""

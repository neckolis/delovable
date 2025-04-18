/**
 * Example: Using Weaviate for semantic search
 * 
 * This file demonstrates how to use the Weaviate client to perform
 * semantic search on your data.
 */

const { 
  createWeaviateClient, 
  createDocumentSchema, 
  addDocument, 
  searchDocuments 
} = require('./weaviate-client');

async function main() {
  try {
    // Create a Weaviate client
    console.log('Creating Weaviate client...');
    const client = createWeaviateClient();
    
    // Create the Document schema if it doesn't exist
    console.log('Setting up Document schema...');
    await createDocumentSchema(client);
    
    // Add some example documents
    console.log('Adding example documents...');
    const documents = [
      {
        title: 'Introduction to Vector Databases',
        content: 'Vector databases store data as high-dimensional vectors, enabling semantic search and AI-powered applications.',
        category: 'database',
        url: 'https://example.com/vector-databases',
      },
      {
        title: 'Getting Started with Weaviate',
        content: 'Weaviate is an open-source vector database that allows you to store data objects and vector embeddings.',
        category: 'tutorial',
        url: 'https://example.com/weaviate-tutorial',
      },
      {
        title: 'Building AI-Powered Search',
        content: 'Semantic search uses AI to understand the meaning behind search queries, providing more relevant results.',
        category: 'ai',
        url: 'https://example.com/ai-search',
      },
    ];
    
    for (const doc of documents) {
      await addDocument(client, doc);
    }
    
    // Perform a semantic search
    console.log('Performing semantic search...');
    const searchQuery = 'How do vector databases work?';
    const searchResults = await searchDocuments(client, searchQuery);
    
    console.log(`Search results for: "${searchQuery}"`);
    searchResults.forEach((result, index) => {
      console.log(`\nResult ${index + 1} (Certainty: ${(result._additional.certainty * 100).toFixed(2)}%):`);
      console.log(`Title: ${result.title}`);
      console.log(`Category: ${result.category}`);
      console.log(`Content: ${result.content.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('Error in Weaviate example:', error);
  }
}

// Run the example
main().catch(console.error);

/**
 * Next steps:
 * 
 * 1. Replace the default configuration in weaviate-client.js with your Weaviate cluster details
 * 2. Install the Weaviate client: npm install weaviate-client
 * 3. Run this example: node example-search.js
 * 
 * Learn more about Weaviate at: https://weaviate.io/developers/weaviate
 */

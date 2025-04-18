/**
 * Weaviate Client for JavaScript
 * 
 * This file was automatically generated by Delovable to help you integrate
 * Weaviate vector database into your project.
 */

const weaviate = require('weaviate-client');

/**
 * Default configuration for Weaviate Cloud Services
 * Replace with your own configuration
 */
const defaultConfig = {
  scheme: 'https',
  host: 'your-cluster-id.weaviate.cloud',  // Replace with your Weaviate cluster
  apiKey: 'your-api-key',                  // Replace with your API key
};

/**
 * Create a Weaviate client instance
 */
function createWeaviateClient(config = defaultConfig) {
  const clientConfig = {
    scheme: config.scheme || 'https',
    host: config.host,
  };

  // Add API key if provided
  if (config.apiKey) {
    clientConfig.apiKey = new weaviate.ApiKey(config.apiKey);
  }

  return weaviate.client(clientConfig);
}

/**
 * Create a schema class for storing documents
 */
async function createDocumentSchema(client) {
  // Check if the class already exists
  const schemaRes = await client.schema.getter().do();
  const classExists = schemaRes.classes?.some(c => c.class === 'Document');
  
  if (classExists) {
    console.log('Document class already exists');
    return;
  }
  
  // Create the Document class
  const classObj = {
    class: 'Document',
    description: 'A document with text content',
    vectorizer: 'text2vec-transformers',  // You can change this to your preferred vectorizer
    properties: [
      {
        name: 'title',
        dataType: ['text'],
        description: 'The title of the document',
      },
      {
        name: 'content',
        dataType: ['text'],
        description: 'The content of the document',
      },
      {
        name: 'category',
        dataType: ['text'],
        description: 'The category of the document',
      },
      {
        name: 'url',
        dataType: ['text'],
        description: 'The URL of the document',
      },
      {
        name: 'createdAt',
        dataType: ['date'],
        description: 'When the document was created',
      }
    ],
  };
  
  try {
    await client.schema.classCreator().withClass(classObj).do();
    console.log('Created Document class successfully');
  } catch (error) {
    console.error('Error creating Document class:', error);
    throw error;
  }
}

/**
 * Add a document to Weaviate
 */
async function addDocument(client, document) {
  try {
    const result = await client.data
      .creator()
      .withClassName('Document')
      .withProperties({
        title: document.title,
        content: document.content,
        category: document.category || 'general',
        url: document.url,
        createdAt: new Date().toISOString(),
      })
      .do();
    
    console.log('Added document successfully:', result);
    return result.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

/**
 * Search for documents by semantic similarity
 */
async function searchDocuments(client, query, limit = 5) {
  try {
    const result = await client.graphql
      .get()
      .withClassName('Document')
      .withFields('title content category url createdAt _additional { certainty }')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();
    
    return result.data.Get.Document;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

module.exports = {
  createWeaviateClient,
  createDocumentSchema,
  addDocument,
  searchDocuments
};

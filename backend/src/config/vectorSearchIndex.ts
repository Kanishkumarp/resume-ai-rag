export interface VectorSearchIndexDefinition {
  name: string;
  definition: {
    mappings: {
      fields: {
        embedding: {
          type: 'knnVector';
          dimensions: number;
          similarity: 'cosine';
        };
      };
    };
  };
}

import { env } from './environment';

export const getVectorSearchIndexDefinition = (): VectorSearchIndexDefinition => ({
  name: env.mongoVectorIndex || 'vector_index',
  definition: {
    mappings: {
      fields: {
        embedding: {
          type: 'knnVector',
          dimensions: Number(env.embeddingDim || 1024),
          similarity: 'cosine',
        },
      },
    },
  },
});

import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Get started',
      collapsible: false,
      items: ['get-started/index', 'get-started/quick-tutorial', 'deploy']
    },
    {
      type: 'category',
      label: 'Connect',
      collapsible: false,
      link: { type: 'doc', id: 'connect/index' },
      items: [
        ...[
          ['connect/sdks', 'sdks'],
          ['connect/sql-and-cypher', 'sql'],
          ['connect/mcp', 'mcp'],
          ['connect/langchain', 'langchain'],
          ['connect/llamaindex', 'llamaindex'],
          ['connect/debezium', 'debezium'],
          ['connect/obsidian', 'obsidian'],
          ['connect/skills', 'skills'],
          ['connect/agents', 'agents'],
          ['connect/openclaw-memory', 'openclaw'],
          ['connect/hermes-memory', 'hermes']
        ].map(([id, name]) => ({
          type: 'doc' as const,
          id,
          className: `connect-sidebar-link connect-sidebar-link--${name}`
        }))
      ]
    },
    {
      type: 'category',
      label: 'Learn',
      collapsible: true,
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Records & queries',
          collapsed: true,
          link: { type: 'doc', id: 'learn/records-and-queries/index' },
          items: [
            'learn/records-and-queries/store-records',
            'learn/records-and-queries/import-data',
            'learn/records-and-queries/find-and-query',
            'learn/records-and-queries/raw-queries',
            'learn/records-and-queries/export-data',
            'learn/records-and-queries/labels-and-properties',
            'learn/records-and-queries/discover-your-schema',
            'learn/records-and-queries/labeled-meta-property-graph',
            'learn/records-and-queries/transactions'
          ]
        },
        {
          type: 'category',
          label: 'Data sources',
          collapsed: true,
          link: { type: 'doc', id: 'learn/data-sources/index' },
          items: ['learn/data-sources/import-files', 'learn/data-sources/connections']
        },
        {
          type: 'category',
          label: 'SearchQuery',
          collapsed: true,
          link: { type: 'doc', id: 'learn/search-query/search-query' },
          items: [
            'learn/search-query/where-operators',
            'learn/search-query/select-expressions',
            'learn/search-query/group-by',
            'learn/search-query/pagination-order',
            'learn/search-query/search-labels',
            'learn/search-query/smart-search',
            'learn/search-query/definitions'
          ]
        },
        {
          type: 'category',
          label: 'Relationships',
          collapsed: true,
          link: { type: 'doc', id: 'learn/relationships/index' },
          items: [
            'learn/relationships/connect-records',
            'learn/relationships/relationship-properties',
            'learn/relationships/bulk-relationships',
            'learn/relationships/suggested-patterns'
          ]
        },
        {
          type: 'category',
          label: 'Search',
          collapsed: true,
          link: { type: 'doc', id: 'learn/semantic-search/semantic-search' },
          items: [
            'learn/semantic-search/keyword-search',
            'learn/semantic-search/hybrid-search',
            'learn/semantic-search/manage-indexes',
            'learn/semantic-search/write-with-vectors',
            'learn/semantic-search/bring-your-own-vectors'
          ]
        },
        {
          type: 'category',
          label: 'Agent memory',
          collapsed: true,
          link: { type: 'doc', id: 'learn/agent-memory/index' },
          items: [
            'learn/agent-memory/quickstart',
            'learn/agent-memory/schema-self-awareness',
            'learn/agent-memory/event-contract'
          ]
        },
        {
          type: 'category',
          label: 'Tutorials',
          collapsed: true,
          link: { type: 'doc', id: 'learn/tutorials/index' },
          items: [
            {
              type: 'category',
              label: 'AI & RAG',
              items: [
                'learn/tutorials/ai-and-rag/ai-semantic-search',
                'learn/tutorials/ai-and-rag/graphrag',
                'learn/tutorials/ai-and-rag/hybrid-retrieval',
                'learn/tutorials/ai-and-rag/rag-pipeline',
                'learn/tutorials/ai-and-rag/rag-evaluation',
                'learn/tutorials/ai-and-rag/rag-multi-source',
                'learn/tutorials/ai-and-rag/rag-reranking',
                'learn/tutorials/ai-and-rag/semantic-search-multitenant',
                'learn/tutorials/ai-and-rag/explainable-results',
                'learn/tutorials/ai-and-rag/byov-when-and-why',
                'learn/tutorials/ai-and-rag/byov-external-embeddings'
              ]
            },
            {
              type: 'category',
              label: 'Agent memory',
              items: [
                'learn/tutorials/agent-memory/agent-safe-query-planning',
                'learn/tutorials/agent-memory/agent-skills-with-openclaw',
                'learn/tutorials/agent-memory/building-team-memory',
                'learn/tutorials/agent-memory/episodic-memory',
                'learn/tutorials/agent-memory/memory-layer',
                'learn/tutorials/agent-memory/research-knowledge-graph'
              ]
            },
            {
              type: 'category',
              label: 'Graph modeling',
              items: [
                'learn/tutorials/graph-modeling/thinking-in-graphs',
                'learn/tutorials/graph-modeling/choosing-relationship-types',
                'learn/tutorials/graph-modeling/modeling-hierarchies',
                'learn/tutorials/graph-modeling/fraud-rings',
                'learn/tutorials/graph-modeling/temporal-graphs',
                'learn/tutorials/graph-modeling/data-lineage',
                'learn/tutorials/graph-modeling/versioning-records',
                'learn/tutorials/graph-modeling/customer-360'
              ]
            },
            {
              type: 'category',
              label: 'Working with data',
              items: [
                'learn/tutorials/working-with-data/importing-data',
                'learn/tutorials/working-with-data/importing-from-mongodb',
                'learn/tutorials/working-with-data/event-driven-ingestion',
                'learn/tutorials/working-with-data/third-party-webhook-ingestion',
                'learn/tutorials/working-with-data/graph-backed-api'
              ]
            },
            {
              type: 'category',
              label: 'Search & queries',
              items: [
                'learn/tutorials/search-and-queries/discovery-queries',
                'learn/tutorials/search-and-queries/reusable-search-query',
                'learn/tutorials/search-and-queries/searchquery-advanced-patterns',
                'learn/tutorials/search-and-queries/search-ux-patterns',
                'learn/tutorials/search-and-queries/query-optimization',
                'learn/tutorials/search-and-queries/testing-searchquery'
              ]
            },
            {
              type: 'category',
              label: 'Use cases',
              items: [
                'learn/tutorials/use-cases/is-rushdb-right-for-me',
                'learn/tutorials/use-cases/cloud-vs-self-hosted',
                'learn/tutorials/use-cases/audit-trails',
                'learn/tutorials/use-cases/compliance-retention',
                'learn/tutorials/use-cases/incident-response',
                'learn/tutorials/use-cases/supply-chain-traceability'
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'SDK & API reference',
      collapsible: true,
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'TypeScript',
          link: { type: 'doc', id: 'learn/reference/typescript/index' },
          items: [
            'learn/reference/typescript/RushDB',
            'learn/reference/typescript/DBRecord',
            'learn/reference/typescript/DBRecordInstance',
            'learn/reference/typescript/DBRecordTarget',
            'learn/reference/typescript/DBRecordsArrayInstance',
            'learn/reference/typescript/Model',
            'learn/reference/typescript/RelationTarget',
            'learn/reference/typescript/relationship-patterns',
            'learn/reference/typescript/SearchQuery',
            'learn/reference/typescript/Transaction'
          ]
        },
        {
          type: 'category',
          label: 'Python',
          link: { type: 'doc', id: 'learn/reference/python/index' },
          items: [
            'learn/reference/python/RushDB',
            'learn/reference/python/record',
            'learn/reference/python/relationship-patterns',
            'learn/reference/python/search-result',
            'learn/reference/python/SearchQuery',
            'learn/reference/python/transaction'
          ]
        },
        {
          type: 'category',
          label: 'MCP',
          link: { type: 'doc', id: 'learn/reference/mcp/index' },
          items: ['learn/reference/mcp/tools']
        },
        {
          type: 'category',
          label: 'REST API [Cloud]',
          link: { type: 'doc', id: 'learn/reference/rest-api/introduction' },
          items: [
            {
              type: 'category',
              label: 'Records',
              items: [
                'learn/reference/rest-api/records/create-records',
                'learn/reference/rest-api/records/get-records',
                'learn/reference/rest-api/records/update-records',
                'learn/reference/rest-api/records/delete-records',
                'learn/reference/rest-api/records/import-data',
                'learn/reference/rest-api/records/export-data'
              ]
            },
            {
              type: 'category',
              label: 'AI & vectors',
              link: { type: 'doc', id: 'learn/reference/rest-api/ai-and-vectors/overview' },
              items: [
                'learn/reference/rest-api/ai-and-vectors/indexing',
                'learn/reference/rest-api/ai-and-vectors/advanced-indexing',
                'learn/reference/rest-api/ai-and-vectors/search',
                'learn/reference/rest-api/ai-and-vectors/write-with-vectors'
              ]
            },
            'learn/reference/rest-api/text-search',
            'learn/reference/rest-api/labels',
            'learn/reference/rest-api/properties',
            'learn/reference/rest-api/relationships',
            'learn/reference/rest-api/transactions',
            'learn/reference/rest-api/raw-queries'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Engine manual',
      collapsible: true,
      collapsed: true,
      link: { type: 'doc', id: 'engine/README' },
      items: [{ type: 'autogenerated', dirName: 'engine' }]
    },
    {
      type: 'category',
      label: 'RushDB Cloud',
      collapsible: true,
      collapsed: true,
      link: { type: 'doc', id: 'rushdb-cloud/index' },
      items: ['rushdb-cloud/capabilities', 'rushdb-cloud/project-isolation']
    },
    {
      type: 'category',
      label: 'Migration',
      collapsible: true,
      collapsed: true,
      items: ['migration/from-2x']
    }
  ]
}

export default sidebars

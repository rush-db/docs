---
sidebar_position: 0
title: TypeScript / JavaScript SDK reference
description: Install the RushDB TypeScript and JavaScript SDK for Node.js and browsers, run a first query, and browse the reference for each class and type it exports.
---

# TypeScript / JavaScript SDK

The official TypeScript/JavaScript SDK for RushDB. Works in Node.js and browser environments.

## Installation

```bash
npm install @rushdb/javascript-sdk
```

## Quick start

```typescript
import RushDB from '@rushdb/javascript-sdk'

const db = new RushDB('RUSHDB_API_KEY')

// Store a record
await db.records.create({
  label: 'User',
  data: { name: 'Alice', role: 'engineer' }
})

// Query records
const { data } = await db.records.find({
  labels: ['User'],
  where: { role: 'engineer' },
  limit: 10
})
```

To connect to a self-hosted engine, use direct mode with the engine's URL and token:

```typescript
const db = new RushDB('ENGINE_TOKEN', {
  direct: true,
  engineUrl: 'http://127.0.0.1:3000'
})
```

See [SDKs](../../../connect/sdks.mdx) for what direct mode offers.

## API reference

| Class                                                                        | Description                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [RushDB](./RushDB.md)                                 | Main client — entry point for all operations                                 |
| [DBRecord](./DBRecord.md)                             | Typed record class returned from queries                                     |
| [DBRecordInstance](./DBRecordInstance.md)             | Active record with instance methods (`attach`, `detach`, `update`, `delete`) |
| [DBRecordsArrayInstance](./DBRecordsArrayInstance.md) | Collection of records with bulk-operation methods                            |
| [Model](./Model.md)                                   | Schema-bound model class for label-scoped operations                         |
| [Relationship Patterns](./relationship-patterns.md)   | Review and apply AI-suggested relationships                                  |
| [Transaction](./Transaction.md)                       | ACID transaction handle                                                      |
| [SearchQuery](./SearchQuery.md)                       | Query builder types and interfaces                                           |
| [DBRecordTarget](./DBRecordTarget.md)                 | Record reference type used in relationship calls                             |
| [RelationTarget](./RelationTarget.md)                 | Relationship target reference type                                           |

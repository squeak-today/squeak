#!/bin/bash
cd frontend
npx openapi-typescript ../api/docs/openapi3.yaml -o src/lib/clients/types.ts
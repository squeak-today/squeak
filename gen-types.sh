#!/bin/bash
cd web
npx openapi-typescript ../api/docs/openapi3.yaml -o src/lib/clients/types.ts
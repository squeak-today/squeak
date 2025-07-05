#!/bin/bash
cd web
npx openapi-typescript ../SNOUT/docs/openapi3.yaml -o src/lib/clients/types.ts
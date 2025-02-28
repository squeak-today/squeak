#!/bin/bash

cd api
swag fmt
swag init
npx swagger-markdown -i ./docs/swagger.yaml -o ../API.md
npx api-spec-converter --from=swagger_2 --to=openapi_3 ./docs/swagger.yaml --syntax=yaml > ./docs/openapi3.yaml
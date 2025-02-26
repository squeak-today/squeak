#!/bin/bash

cd api
swag fmt
swag init
npx swagger-markdown -i ./docs/swagger.yaml -o ../API.md
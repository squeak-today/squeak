#!/bin/bash

GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip function.zip bootstrap
mv function.zip ../infrastructure/front-function.zip
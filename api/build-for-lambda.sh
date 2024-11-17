#!/bin/bash

GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
zip front-function.zip bootstrap
mv front-function.zip ../infrastructure/front-function.zip
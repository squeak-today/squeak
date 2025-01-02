#!/bin/bash

GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
powershell Compress-Archive -Force -Path bootstrap -DestinationPath function.zip
mv function.zip ../infrastructure/filler-function.zip
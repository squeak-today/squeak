$env:GOOS="linux"
$env:GOARCH="amd64"
$env:CGO_ENABLED="0"
go build -o bootstrap .

Compress-Archive -Force -Path bootstrap -DestinationPath function.zip
Move-Item -Force function.zip ../infrastructure/function.zip

# if execution not allowed
# Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
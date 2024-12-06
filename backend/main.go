package main

import (
    "fmt"
    "net/http"

    "github.com/MicahParks/keyfunc"
    "github.com/golang-jwt/jwt/v4"
    "github.com/rs/cors"
)

var jwksURL = "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_G2iCM2gu1/.well-known/jwks.json"

func verifyToken(tokenString string) (*jwt.Token, error) {
	fmt.Println("Verifying token:", tokenString) // Debug log

    jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
    if err != nil {
        return nil, fmt.Errorf("failed to create JWKS client: %v", err)
    }

    token, err := jwt.Parse(tokenString, jwks.Keyfunc)
    if err != nil {
        return nil, fmt.Errorf("failed to parse token: %v", err)
    }

    if !token.Valid {
        return nil, fmt.Errorf("invalid token")
    }

    return token, nil
}

func protectedHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, "Authorization header required", http.StatusUnauthorized)
        return
    }

    tokenString := authHeader[len("Bearer "):]
    token, err := verifyToken(tokenString)
    if err != nil {
        http.Error(w, err.Error(), http.StatusUnauthorized)
        return
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        http.Error(w, "Failed to parse claims", http.StatusInternalServerError)
        return
    }

    username, ok := claims["cognito:username"].(string)
    if !ok {
        http.Error(w, "Username claim missing", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, "Hello, %s!", username)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/protected", protectedHandler)

    // Enable CORS
    handler := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"},
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
    }).Handler(mux)

    fmt.Println("Backend running on port 8080")
    http.ListenAndServe(":8080", handler)
}

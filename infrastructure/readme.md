Run with `terraform apply`.
Will output a UserPoolId and a ClientId.
Use the UserPoolID and ClientID to update the UserPool.js file and use the UserPoolID
to update the jwksURL in main.go
Use in `frontend/src/UserPool.js` for frontend access to accounts.
import { CognitoUserPool } from "amazon-cognito-identity-js";

// See README in ../infrastructure
const poolData = {
	UserPoolId: "us-east-2_XXX",
	ClientId: "xxxxxx..."
}
const userPool = new CognitoUserPool(poolData);

export default userPool;
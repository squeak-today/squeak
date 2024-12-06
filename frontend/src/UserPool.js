import { CognitoUserPool } from "amazon-cognito-identity-js";

// See README in ../infrastructure
const poolData = {
	UserPoolId: "us-east-2_G2iCM2gu1",
	ClientId: "1o3ng4n9f1nvnbq3q73jhvgs42"
}
const userPool = new CognitoUserPool(poolData);

export default userPool;
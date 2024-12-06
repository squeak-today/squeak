import { CognitoUserPool } from "amazon-cognito-identity-js";

// See README in ../infrastructure
const poolData = {
	UserPoolId: "us-east-2_eF9Q12Lbf",
	ClientId: "5r54ke8o2su8uumff0hajh1ls3"
}
const userPool = new CognitoUserPool(poolData);

export default userPool;
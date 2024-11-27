import React, { createContext } from 'react';
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Pool from "./UserPool";

const AccountContext = createContext();

const Account = (props) => {

	const getSession = async () => {
		return await new Promise((resolve, reject) => {
			const user = Pool.getCurrentUser();
			if (user) {
				user.getSession((err, session) => {
					if (err) {
						reject(err);
					} else {
						resolve(session);
					}
				});
			} else {
				reject();
			}
		});
	};

	const authenticate = async (Username, Password) => {
		return await new Promise((resolve, reject) => {
			const user = new CognitoUser({ Username, Pool });
			const authDetails = new AuthenticationDetails({ Username, Password });

			user.authenticateUser(authDetails, {
				onSuccess: (data) => {
					console.log("onSuccess: ", data);
					resolve(data);
				},
				onFailure: (err) => {
					console.error("onFailure: ", err);
					reject(err);
				},
				newPasswordRequired: (data) => {
					console.log("newPasswordRequired: ", data);
					resolve(data);
				}
			});
		});
	};

	const confirmUser = async (Username, code) => {
		return await new Promise((resolve, reject) => {
			const cognitoUser = new CognitoUser({ Username, Pool });
			cognitoUser.confirmRegistration(code, true, (err, result) => {
				if (err) {
					console.error('Error confirming sign-up', err);
					reject(err);
				}
				console.log('User confirmed:', result);
				resolve(result);
			});
		});
	};

	const logout = () => {
		const user = Pool.getCurrentUser();
		if (user) {
			user.signOut();
			console.log("Logged out!");
		}
	};
	return (
		<AccountContext.Provider value={{ authenticate, getSession, logout, confirmUser }}>
			{props.children}
		</AccountContext.Provider>
	)
};
export { Account, AccountContext };
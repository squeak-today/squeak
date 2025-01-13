import { Account, AccountContext } from '../Account';
import { useState, useContext } from 'react';
import { StyledBox, Subtitle, InputField, GenerateButton } from './StyledComponents';

import UserPool from "../UserPool";
import Status from "./Status";

const SignUp = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [authCode, setAuthCode] = useState("");
	const { confirmUser } = useContext(AccountContext);

	const onSubmit = (event) => {
		event.preventDefault();

		UserPool.signUp(email, password, [], null, (err, data) => {
			if (err) {
				console.error(err);
			}
			console.log(data);
		});
	}

	const onConfirmSubmit = (event) => {
		event.preventDefault();
		console.log(email);
		console.log(authCode);
		confirmUser(email, authCode).then(data => {
			console.log("Confirmed!", data);
		})
		.catch((err) => {
			console.error("Failed to confirm!", err);
		})
	};

	return (
		<StyledBox>
			{/* ugly sign-in */}
			<div>
				<Subtitle>Create Account</Subtitle>
				<form onSubmit={onSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={password}
						type="password"
						placeholder="Password"
						onChange={(event) => setPassword(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Signup</GenerateButton>
				</form>
				
				<Subtitle>Confirm User</Subtitle>
				<form onSubmit={onConfirmSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={authCode}
						placeholder="Authentication Code"
						onChange={(event) => setAuthCode(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Submit</GenerateButton>
				</form>
			</div>
		</StyledBox>
	)
}

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { authenticate } = useContext(AccountContext); 

	const onSubmit = (event) => {
		event.preventDefault();
		authenticate(email, password).then(data => {
			console.log("Logged in!", data);
		})
		.catch((err) => {
			console.error("Failed to log in!", err);
		})
	}

	return (
		<StyledBox>
			<Subtitle>Login</Subtitle>
			{/* ugly sign-in */}
			<div>
				<form onSubmit={onSubmit}>
					<InputField
						value={email}
						placeholder="Email"
						onChange={(event) => setEmail(event.target.value)}>
					</InputField>
					<InputField
						value={password}
						type="password"
						placeholder="Password"
						onChange={(event) => setPassword(event.target.value)}>
					</InputField>
					<GenerateButton type="submit">Login</GenerateButton>
				</form>
			</div>
		</StyledBox>
	)
}

function AuthBlocks() {
    return (
        <Account>
            <Status />
			<SignUp />
			<Login />
        </Account>
    )
}

export default AuthBlocks;
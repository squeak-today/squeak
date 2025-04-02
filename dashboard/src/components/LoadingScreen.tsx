import { LoadingOverlay, Spinner, LoadingText } from "../styles/components/LoadingScreenStyles";


function LoadingScreen() {
    return (
        <LoadingOverlay>
            <Spinner />
            <LoadingText>Loading...</LoadingText>
        </LoadingOverlay>
    );
}

export default LoadingScreen;
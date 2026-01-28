import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const query = new URLSearchParams(location.search);
            const token = query.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                // Assuming backend runs on the same domain or configured CORS
                // For local dev, might need localhost:5000, but for prod needs relative or env var
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await axios.post(`${apiUrl}/api/auth/verify-email`, { token });
                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
            }
        };

        verify();
    }, [location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex justify-center mb-4">
                        <span className="text-6xl">📧</span>
                    </CardTitle>
                    <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-center text-muted-foreground">{message}</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <p className="text-center text-green-600 font-medium">{message}</p>
                            <Button className="w-full mt-4" onClick={() => navigate('/auth')}>
                                Go to Login
                            </Button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <XCircle className="h-12 w-12 text-destructive" />
                            <p className="text-center text-destructive font-medium">{message}</p>
                            <Button variant="outline" className="w-full mt-4" asChild>
                                <Link to="/auth">Back to Login</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;

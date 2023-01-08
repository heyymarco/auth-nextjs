import { Button, Card, CardBody, CardHeader, Check, PasswordInput, TextInput } from '@reusable-ui/components';
import Head from 'next/head'
import { Auth, useAuth } from '../components/auth';
import { Main } from '../components/Main'
import axios from '../libs/axios';
import { useRouter } from 'next/router';



export default function Login() {
    const [, setAuth] = useAuth();
    const router = useRouter();
    
    const handleSubmit : React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const requestData = new FormData(event.currentTarget);
        
        try {
            const response = await axios.post(
                '/login',
                JSON.stringify(Object.fromEntries(requestData.entries())),
                {
                    headers         : { 'Content-Type': 'application/json' },
                    withCredentials : true, // wants to receive any cookie
                },
            );
            const responseData = response.data;
            const accessToken  = responseData?.accessToken ?? '';
            if (!accessToken) {
                alert(`login failed`);
                return;
            } // if
            
            
            
            setAuth(new Auth(accessToken));
            router.replace(new URLSearchParams(window.location.search).get('from') ?? '/');
        }
        catch (error) {
            alert(`login failed: ${error}`);
        } // try
    };
    
    
    
    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="description" content="the login page" />
            </Head>
            <Main>
                <p>
                    Please login!
                </p>
                <Card theme='primary'>
                    <CardHeader>
                        Login
                    </CardHeader>
                    <CardBody tag='form' onSubmit={handleSubmit}>
                        <TextInput name='username' required />
                        <PasswordInput name='password' required />
                        <Button type='submit'>Submit</Button>
                        <hr />
                        <Check active={Auth.persistLogin} onActiveChange={(event) => Auth.persistLogin = event.active}>Trust this device</Check>
                    </CardBody>
                </Card>
            </Main>
        </>
    );
}

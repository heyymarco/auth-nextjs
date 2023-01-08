import { Button, Card, Form, CardHeader, Check, PasswordInput, TextInput, CardBody, CardFooter } from '@reusable-ui/components';
import Head from 'next/head'
import { Auth, useAuth } from '../components/auth';
import { Main } from '../components/Main'
import axios from '../libs/axios';
import { useRouter } from 'next/router';
import { useState } from 'react';



export default function Login() {
    const [, setAuth] = useAuth();
    const router = useRouter();
    const [enableValidation, setEnableValidation] = useState(false);
    
    const handleSubmit : React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        setEnableValidation(true);
        if (!event.currentTarget.checkValidity()) return;
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
                    <CardBody>
                        <Form nude={true} noValidate enableValidation={enableValidation} onSubmit={handleSubmit}>
                            <TextInput name='username' required placeholder='username' />
                            <PasswordInput name='password' required placeholder='password' />
                            <Button type='submit'>Submit</Button>
                        </Form>
                    </CardBody>
                    <CardFooter>
                        <Check checkStyle='switch' active={Auth.persistLogin} onActiveChange={(event) => Auth.persistLogin = event.active}>Trust this device</Check>
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}

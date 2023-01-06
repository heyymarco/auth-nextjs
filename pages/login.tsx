import Head from 'next/head'
import { Main } from '../components/Main'



export default function Login() {
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
            </Main>
        </>
    );
}

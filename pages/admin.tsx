import Head from 'next/head'
import { RequireAuth, Role } from '../components/RequireAuth';
import { Main } from '../components/Main'



export default function Admin() {
    return (
        <RequireAuth roles={[Role.Admin]}>
            <Head>
                <title>Login</title>
                <meta name="description" content="the login page" />
            </Head>
            <Main>
                <p>
                    This is an admin area.
                </p>
            </Main>
        </RequireAuth>
    );
}

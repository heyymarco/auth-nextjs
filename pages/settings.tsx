import Head from 'next/head'
import { RequireAuth, Role } from '../components/auth';
import { Main } from '../components/Main'



export default function Settings() {
    return (
        <RequireAuth roles={['admin']}>
            <Head>
                <title>Settings</title>
                <meta name="description" content="the setting page" />
            </Head>
            <Main>
                <p>
                    This is a setting page.
                </p>
            </Main>
        </RequireAuth>
    );
}

import Head from 'next/head'
import { RequireAuth, Role } from '../components/auth';
import { Main } from '../components/Main'



export default function Posts() {
    return (
        <RequireAuth roles={[Role.Admin, Role.Editor]}>
            <Head>
                <title>Posts</title>
                <meta name="description" content="the posts page" />
            </Head>
            <Main>
                <p>
                    Posts here...
                </p>
            </Main>
        </RequireAuth>
    );
}

import Head from 'next/head'
import { RequireAuth, Role } from '../components/auth';
import { Main } from '../components/Main'



export default function Posts() {
    return (
        <RequireAuth roles={['admin', 'editor']}>
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

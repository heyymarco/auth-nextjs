import { Button } from '@reusable-ui/components';
import Head from 'next/head'
import { RequireAuth, Role, useAuth } from '../components/auth';
import { Main } from '../components/Main'



export default function Posts() {
    const [auth] = useAuth();
    const handleDelete = async () => {
        try {
            // const response = await axios.delete('post', {
            //     headers         : { 'Content-Type': 'application/json' },
            //     withCredentials : true,
            // });
            const response = await auth?.axios?.delete('post');
            console.log(response?.data);
        }
        catch (error) {
            alert(`delete failed: ${error}`);
        } // try
    };
    
    
    
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
                <Button theme='danger' onClick={handleDelete}>
                    Delete
                </Button>
            </Main>
        </RequireAuth>
    );
}

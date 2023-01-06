import Head from 'next/head'
import styles from '../styles/Home.module.css'



export default function Home() {
    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="description" content="the login page" />
            </Head>
            <main className={styles.main}>
                <p>
                    Please login!
                </p>
            </main>
        </>
    )
}

import Head from 'next/head'
import styles from '../styles/Home.module.css'



export default function Home() {
    return (
        <>
            <Head>
                <title>Home</title>
                <meta name="description" content="the homepage" />
            </Head>
            <main className={styles.main}>
                <p>
                    Welcome to my site!
                </p>
            </main>
        </>
    )
}

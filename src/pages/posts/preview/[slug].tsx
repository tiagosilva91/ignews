import { GetStaticProps } from "next"
import { RichText } from "prismic-dom"
import Head from 'next/head'
import { getPrismicClient } from "../../../services/prismic"
import styles from '../post.module.scss';
import Link from 'next/link'
import { useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from '../../../services/api';
import { getStripeJs } from '../../../services/stripe-js';

interface PostProps{
    post:{
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}


export default function PostPreview({post}: PostProps){
    const [session] = useSession()
    const router = useRouter()

    async function handleSubscribe(){
        if(!session){
            signIn('github')
            return;
        }

        if(session.activeSubscription) {
            router.push('/posts')
            return;
        }

        try {
            const response = await api.post('/subscribe')
          
            const { sessionId } = response.data;
          
            const stripe = await getStripeJs()
          
            await stripe.redirectToCheckout({ sessionId })
          } catch (err) {
            console.log(err)
            alert(err.message);
          }

    }

    useEffect(() =>{
        if(session?.activeSubscription){
            router.push(`/posts/${post.slug}`)
        }
    }, [session])
    return(
        <>
            <Head>
                <title>{post.title} | Ignews </title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div className={`${styles.postContent} ${styles.postContentPreview}`} 
                    dangerouslySetInnerHTML={{__html: post.content}} ></div>
                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link href='/'>
                            <a href="" >Subscribe now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>
    )
}


export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params}) => {
    
    const {slug} = params
    
    
    const prismic = getPrismicClient()
    const response = await prismic.getByUID('publication', String(slug), {})
    
    const post ={
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice (0,3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    return {
        props:{
            post,
        },
        redirect: 60*30,
    }

}

import Head  from 'next/head'
import React from 'react'
import SubscriberButton from '../components/SubscribeButton'
import styles from './home.module.scss'
import  {GetStaticProps}  from 'next'
import { stripe } from '../services/stripe'

interface HomeProps{
  product:{
    priceId: string;
    amount: number;

  }
}

export default function Home({ product }: HomeProps) {
  

  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      
      <main className={styles.contenContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br/>
            <span>for {
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(product.amount)
              } month</span>
          </p>
          <SubscriberButton priceId={product.priceId}/>
        </section>

        <img src="/images/avatar.svg" alt="girl coding" />
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1JK3vxBxJubQd8zIHhGgxTni')

  const product = {
    priceId: price.id,
    amount: (price.unit_amount/100.00)
  }
  return{
    props: {
      product
    },revalidate: 60 * 60 * 24, //24hours
  }
}
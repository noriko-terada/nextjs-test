import { useState } from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'  // getServerSideProps で使用
import Link from 'next/link'

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>
}

/**
 * ページ関数
 * @returns HTML
 */
 const HomePage = (props:Props) => {

  return (
    <div>
      <Header title="ユーザ登録　結果画面" />
      <label>【getServerSideProps】 is logged in: {props.isLoggedin}</label>
      <br/>
      <br/>
      <Link href="/vtecx_test">汎用APIテスト</Link>
    </div>
  );
}

// propsの型を定義する
type Props = {
  isLoggedin?: string
}

// サーバサイドで実行する処理(getServerSideProps)を定義する
export const getServerSideProps:GetServerSideProps = async (context:GetServerSidePropsContext) => {
  // vtecxnext 呼び出し
  let rxid = ''
  if ('_RXID' in context.query) {
    const tmp = context.query._RXID
    if (Array.isArray(tmp)) {
      rxid = tmp[0]
    } else if (typeof tmp === 'string') {
      rxid = tmp
    }
  }

  let isLoggedin
  if (rxid) {
    isLoggedin = await vtecxnext.loginWithRxid(context.req, context.res, rxid)
  } else {
    isLoggedin = false
  }

  const props: Props = {
    isLoggedin: String(isLoggedin)
  }
  console.log(`[vtecx_signup_completion getServerSideProps] props.isLoggedin=${props.isLoggedin}`)

  return {
    props: props,
  }
}

export default HomePage

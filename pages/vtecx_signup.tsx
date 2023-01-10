import { useState } from 'react'
import { getHashpass } from '@vtecx/vtecxauth'
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import * as browserutil from 'utils/browserutil'

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>
}

/**
 * ページ関数
 * @returns HTML
 */
 const HomePage = () => {
  const [username, setUsername] = useState('')
  const [pswrd, setPswrd] = useState('')
  const [result, setResult] = useState('')
  // ホームページ関数内で定義
  const { executeRecaptcha } = useGoogleReCaptcha()

  /**
   * ユーザ登録リクエスト
   * API Routeにリクエストする
   * @param username ユーザ名
   * @param passhash パスワード(ハッシュ化済み)
   * @param reCaptchaToken reCAPTCHAトークン
   * @returns API Routeからの戻り値
   */
  const adduser = async (username:string, passhash:string, reCaptchaToken:string) => {
    console.log('[adduser] start.')
    const method = 'POST'
    const apiAction = 'adduser'
    const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
    const linkurl = `${process.env.NEXT_PUBLIC_VTECXNEXT_URL}/vtecx_signup_completion`
    const toppage = `${process.env.NEXT_PUBLIC_VTECXNEXT_URL}/vtecx_login`
    const reqJson:any = [{
      'contributor': [{
        'uri': `urn:vte.cx:auth:${username},${passhash}`
      }],
      'title': '[vtecxnextテスト] ユーザ登録のご案内',
      'summary': `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nこのメールは、vtecxnextテストサービス から配信されています。\nこのメールに心当たりのない方は破棄お願いします。\nこのメールにご返信できませんのでご了承ください。\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nこの度は、vtecxnextテストサービス にお申込みいただき、ありがとうございました。\n以下のURLをクリックして本登録を完了してください。\n\n${linkurl}?_RXID=\${RXID}\n\nこちらのリンクはご登録より24時間を過ぎますとクリック時にエラーになります。\nその場合はお手数ではございますが再度お申込みからお願いいたします。\nトップページ ${toppage}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nvte.cx\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    }]

    const reqData = JSON.stringify(reqJson)
    console.log(`[adduser] reqData = ${reqData}`)

    const data = await browserutil.requestApi(method, apiAction, param, reqData)
    if ('feed' in data) {
      return data.feed.title
    } else {
      return 'no feed'
    }
  }
  
  const handleClick = async () => {
    console.log(`[handleClick start] username=${username}, pass=${pswrd}`)
    // 結果表示欄をクリア
    setResult('')
    // reCAPTCHAトークンを取得
    const reCaptchaToken = executeRecaptcha? await executeRecaptcha('contactPage') : ''
    // パスワードをハッシュ化
    const passhash = getHashpass(pswrd)
    // ユーザ登録
    const retStr = await adduser(username, passhash, reCaptchaToken)
    // 結果表示
    setResult(retStr)
    console.log(`[handleClick end]`)
  }

  return (
    <div>
      <Header title="ユーザ登録" />
      <table>
        <tbody>
          <tr>
            <td><label>メールアドレス: </label></td>
            <td><input type="text" id="username" name="username" value={username} 
                       onChange={(event) => setUsername(event.target.value)} /></td>
          </tr>
          <tr>
            <td><label>パスワード: </label></td>
            <td><input type="password" id="pswrd" name="pswrd" value={pswrd}
                       onChange={(event) => setPswrd(event.target.value)} /></td>
          </tr>
          <tr>
            <td><label></label></td>
            <td><label className="recaptcha">This site is protected by reCAPTCHA and the Google
                       <a href="https://policies.google.com/privacy">Privacy Policy</a> and
                       <a href="https://policies.google.com/terms">Terms of Service</a> apply.</label></td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleClick}>登録</button>
      <p>{result}</p>
    </div>
  );
}

export default HomePage


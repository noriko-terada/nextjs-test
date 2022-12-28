import { useState } from 'react'
import { getAuthToken } from '@vtecx/vtecxauth'
import Link from 'next/link'
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
   * ログインリクエスト
   * API Routeにリクエストする
   * @param wsse WSSE
   * @param reCaptchaToken reCAPTCHAトークン
   * @returns API Routeからの戻り値
   */
  const login = async (wsse:string, reCaptchaToken:string) => {
    console.log('[login] start.')
    const method = 'GET'
    const apiAction = 'login'
    const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
    const headers = {'X-WSSE': wsse}
    const data = await browserutil.requestApi(method, apiAction, param, null, headers)
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
    // WSSEを生成
    const wsse = getAuthToken(username, pswrd)
    // ログイン
    const retStr = await login(wsse, reCaptchaToken)
    // 結果表示
    setResult(retStr)
    console.log(`[handleClick end]`)
  }

  return (
    <div>
      <Header title="ログイン" />
      <table>
        <tbody>
          <tr>
            <td><label>ユーザ名: </label></td>
            <td><input type="text" id="username" name="username" value={username} 
                       onChange={(event) => setUsername(event.target.value)} /></td>
          </tr>
          <tr>
            <td><label>Password: </label></td>
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
      <button onClick={handleClick}>login</button>
      <p>{result}</p>
      <Link href="/vtecx_test">汎用APIテスト</Link>
      <br/>
      <Link href="/vtecx_signup">新規ユーザ登録</Link>
    </div>
  );
}

export default HomePage

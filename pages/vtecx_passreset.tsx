import { useState } from 'react'
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
  const [result, setResult] = useState('')
  // ホームページ関数内で定義
  const { executeRecaptcha } = useGoogleReCaptcha()

  /**
   * パスワード変更のためのメール送信リクエスト
   * API Routeにリクエストする
   * @param username ユーザ名
   * @param reCaptchaToken reCAPTCHAトークン
   * @returns API Routeからの戻り値
   */
  const passreset = async (username:string, reCaptchaToken:string) => {
    console.log('[passreset] start.')
    const method = 'POST'
    const apiAction = 'passreset'
    const param = reCaptchaToken ? `g-recaptcha-token=${reCaptchaToken}` : ''
    const linkurl = `${process.env.NEXT_PUBLIC_VTECXNEXT_URL}/vtecx_changepass`
    const loginpage = `${process.env.NEXT_PUBLIC_VTECXNEXT_URL}/vtecx_login`
    const reqJson:any = [{
      'contributor': [{
        'uri': `urn:vte.cx:auth:${username}`
      }],
      'title': '[vtecxnextテスト] パスワード変更のご案内',
      'summary': `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nこのメールは、vtecxnextテストサービス から配信されています。\nこのメールに心当たりのない方は破棄お願いします。\nこのメールにご返信できませんのでご了承ください。\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n以下のURLをクリックしてパスワード変更を行ってください。\n\n${linkurl}?\${PASSRESET_TOKEN}\n\n設定が完了いたしますと、新しいパスワードでサービスがご利用できるようになります。\n\nこちらのリンクはご登録より24時間を過ぎますとクリック時にエラーになります。\nその場合はお手数ではございますが再度お申込みからお願いいたします。\n\nログインページ ${loginpage}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nvte.cx\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    }]

    const reqData = JSON.stringify(reqJson)
    console.log(`[passreset] reqData = ${reqData}`)

    const data = await browserutil.requestApi(method, apiAction, param, reqData)
    if ('feed' in data) {
      return data.feed.title
    } else {
      return 'no feed'
    }
  }
  
  const handleClick = async () => {
    console.log(`[handleClick start] username=${username}`)
    // 結果表示欄をクリア
    setResult('')
    // reCAPTCHAトークンを取得
    const reCaptchaToken = executeRecaptcha? await executeRecaptcha('contactPage') : ''
    // ユーザ登録
    const retStr = await passreset(username, reCaptchaToken)
    // 結果表示
    setResult(retStr)
    console.log(`[handleClick end]`)
  }

  return (
    <div>
      <Header title="パスワード変更" />
      <table>
        <tbody>
          <tr>
            <td><label>メールアドレス: </label></td>
            <td><input type="text" id="username" name="username" value={username} 
                       onChange={(event) => setUsername(event.target.value)} /></td>
          </tr>
          <tr>
            <td><label></label></td>
            <td><label className="recaptcha">This site is protected by reCAPTCHA and the Google
                       <a href="https://policies.google.com/privacy">Privacy Policy</a> and
                       <a href="https://policies.google.com/terms">Terms of Service</a> apply.</label></td>
          </tr>
        </tbody>
      </table>
      <button onClick={handleClick}>メール送信</button>
      <p>{result}</p>
    </div>
  );
}

export default HomePage

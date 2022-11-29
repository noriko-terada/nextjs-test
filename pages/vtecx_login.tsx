import { useState } from 'react'
import { getAuthToken } from 'vtecxauth'
import Link from 'next/link'
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>
}

/**
 * ページ関数
 * @returns HTML
 */
export default function HomePage() {
  const [username, setUsername] = useState("")
  const [pswrd, setPswrd] = useState("")
  const [result, setResult] = useState("")
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
    const param = reCaptchaToken ? `?g-recaptcha-token=${reCaptchaToken}` : ''
    const response = await fetch(`api/login${param}`,
    {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-WSSE': wsse
      }
    })

    console.log(`[login] response. ${response}`)
    const data = await response.json()
    
    // header一覧
    const it = response.headers.entries()
    let tmp = it.next()
    while (!tmp.done) {
      console.log(`[login] response.header = ${tmp.value[0]} : ${tmp.value[1]}`)
      tmp = it.next()
    }

    const cookie = response.headers.get('set-cookie')
    console.log(`[login] set-cookie:${cookie}`)

    console.log(data)
    if ('feed' in data) {
      return data.feed.title
    } else {
      return 'no feed'
    }
  }
  
  const handleClick = async () => {
    console.log(`[handleClick start] username=${username}, pass=${pswrd}`)
    // 結果表示欄をクリア
    setResult("")
    // reCAPTCHAトークンを取得
    const reCaptchaToken = executeRecaptcha? await executeRecaptcha('contactPage') : null
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
        </tbody>
      </table>
      <button onClick={handleClick}>login</button>
      <p>{result}</p>
      <Link href="/vtecx_test">汎用APIテスト</Link>
    </div>
  );
}
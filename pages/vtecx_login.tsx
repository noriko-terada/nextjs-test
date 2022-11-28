import { useState } from 'react';
import { getAuthToken } from 'vtecxauth'
import Link from 'next/link'

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [pswrd, setPswrd] = useState("");
  const [result, setResult] = useState("");

  const login = async (wsse:string) => {
    console.log('[login] start.')
    const response = await fetch('api/login',
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
  
  const requestLogin = () => {
    console.log(`[requestLogin] start.`)
    setResult("")
    // WSSEを生成
    const wsse = getAuthToken(username, pswrd)
    const promise = login(wsse)
    promise.then((retStr) => {
      console.log(`[requestLogin] data=${retStr}`) // `data.json()` の呼び出しで解釈された JSON データ
      setResult(retStr)
    }).catch((err) => {
      console.log(`[requestLogin] err=${err}`)
      setResult("login failed.")
    })
  }
  
  const handleClick = () => {
    console.log(`[handleClick start] username=${username}, pass=${pswrd}`)
    requestLogin()
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
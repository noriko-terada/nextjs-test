import { useState } from 'react';
import { getAuthToken } from 'vtecxauth'

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {
  const [action, setAction] = useState("");

  const [urlparam, setUrlparam] = useState("");
  const [reqdata, setReqdata] = useState("");
  const [result, setResult] = useState("");

  const options = [
    {
      label: "--- 選択してください ---",
      value: "select",
    },
    {
      label: "uid (/d)",
      value: "uid",
    },
    {
      label: "whoami (/d)",
      value: "whoami",
    },
    {
      label: "post log (リクエストデータ)",
      value: "log",
    },
    {
      label: "get entry (URLパラメータ:uri)",
      value: "getentry",
    },
    {
      label: "get feed (URLパラメータ:uri={キー}[&検索条件])",
      value: "getfeed",
    },
    {
      label: "get count (URLパラメータ:uri={キー}[&検索条件])",
      value: "getcount",
    },
    {
      label: "post entry (リクエストデータ、[URLパラメータ:uri={キー}])",
      value: "postentry",
    },
    {
      label: "put entry (リクエストデータ)",
      value: "putentry",
    },
    {
      label: "delete entry (URLパラメータ:uri={キー})",
      value: "deleteentry",
    },
    {
      label: "logout",
      value: "logout",
    },
  ];

  /**
   * 戻り値がJSONのリクエスト
   * @param method メソッド
   * @param apiAction サーバサイドJS名
   * @param body リクエストデータ
   * @returns レスポンスJSON
   */
  const request = async (method:string, apiAction:string, body:any) => {
    console.log('[request] start.')
    const requestInit:RequestInit = {
      body: body,
      method: method,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  
    const response = await fetch(`api/${apiAction}?${urlparam}`, requestInit)

    console.log(`[request] response. ${response}`)
    const data = await response.json()
    console.log(data)
    return data
  }
   
  const doRequest = () => {
    setResult("")
    console.log(`[doRequest] start. action=${action}`)
    // selectの値を取得
    let method
    let apiAction
    let body
    if (action === "uid" || action === "whoami" || action === "getentry" || action === "getfeed" ||
        action === "getcount" || action === "logout") {
      method = "GET"
    } else if (action === "log" || action === "postentry") {
      method = "POST"
      body = reqdata
    } else if (action === "putentry") {
      method = "PUT"
      body = reqdata
    } else if (action === "deleteentry") {
      method = "DELETE"
    }

    if (method != null) {
      const promise = request(method, action, body)
      promise.then((data) => {
        const feedStr = JSON.stringify(data)
        console.log(`[doRequest] data=${feedStr}`)
        setResult(feedStr)
      }).catch((err) => {
        console.log(`[doRequest] err=${err}`)
        setResult("Error occured.")
      })
    } else {
      setResult(`no action: ${action}`)
    }
  }
  
  const handleClick = () => {
    console.log(`[handleClick start]`)
    doRequest()
    console.log(`[handleClick end]`)
  }

  return (
    <div>
      <Header title="vte.cx 汎用APIテスト" />
      <select name="action" value={action} onChange={(e) => setAction(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <br/>
      <table>
        <tbody>
          <tr>
            <td align="right" valign="top"><label>URLパラメータ: </label></td>
            <td valign="top"><input type="text" size="54" id="urlparam" name="urlparam" value={urlparam} 
                       onChange={(event) => setUrlparam(event.target.value)} /></td>
          </tr>
          <tr>
            <td align="right" valign="top"><label>リクエストデータ: </label></td>
            <td valign="top"><textarea rows="5" cols="50" id="reqdata" name="reqdata" value={reqdata}
                       onChange={(event) => setReqdata(event.target.value)} /></td>
          </tr>
        </tbody>
      </table>
      <br/>
      <button onClick={handleClick}>実行</button>
      <br/>
      <label>実行結果: </label>
      <br/>
      <p>{result}</p>
      <br/>

    </div>
  );
}
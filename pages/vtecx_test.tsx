import { useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import * as vtecxnext from 'utils/vtecxnext'  // getServerSideProps で使用
import { isPropertySignature } from 'typescript';

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

const HomePage = (props:Props) => {
  const [action, setAction] = useState('');
  const [urlparam, setUrlparam] = useState('');
  const [reqdata, setReqdata] = useState('');
  const [result, setResult] = useState('');

  const options = [
    {
      label: '--- 選択してください ---',
      value: 'select',
    },
    {
      label: 'uid (/d)',
      value: 'uid',
    },
    {
      label: 'whoami (/d)',
      value: 'whoami',
    },
    {
      label: 'is logged in',
      value: 'isloggedin',
    },
    {
      label: 'post log (リクエストデータ)',
      value: 'log',
    },
    {
      label: 'get entry (URLパラメータ:uri)',
      value: 'getentry',
    },
    {
      label: 'get feed (URLパラメータ:uri={キー}[&検索条件])',
      value: 'getfeed',
    },
    {
      label: 'get count (URLパラメータ:uri={キー}[&検索条件])',
      value: 'getcount',
    },
    {
      label: 'post entry (リクエストデータ、[URLパラメータ:uri={キー}])',
      value: 'postentry',
    },
    {
      label: 'put entry (リクエストデータ)',
      value: 'putentry',
    },
    {
      label: 'delete entry (URLパラメータ:uri={キー})',
      value: 'deleteentry',
    },
    {
      label: 'logout (/d)',
      value: 'logout',
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
   
  const doRequest = async () => {
    setResult('')
    console.log(`[doRequest] start. action=${action}`)
    // selectの値を取得
    let method
    let apiAction
    let body
    if (action === 'uid' || action === 'whoami' || action === 'isloggedin' || action === 'getentry' || 
        action === 'getfeed' || action === 'getcount' || action === 'logout') {
      method = 'GET'
    } else if (action === 'log' || action === 'postentry') {
      method = 'POST'
      body = reqdata
    } else if (action === 'putentry') {
      method = 'PUT'
      body = reqdata
    } else if (action === 'deleteentry') {
      method = 'DELETE'
    }

    if (method != null) {
      const data = await request(method, action, body)
      const feedStr = JSON.stringify(data)
      console.log(`[doRequest] data=${feedStr}`)
      setResult(feedStr)

    } else {
      setResult(`no action: ${action}`)
    }
  }
  
  const sizeText = 54
  const rowTextarea = 5
  const colsTextarea = 50
  console.log(`[HomePage] props.isLoggedin=${props.isLoggedin}`)

  return (
    <div>
      <Header title="vte.cx 汎用APIテスト" />
      <label>【getServerSideProps】 is logged in: {props.isLoggedin}</label>
      <br/>
      <br/>
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
            <td valign="top"><input type="text" size={sizeText} id="urlparam" name="urlparam" value={urlparam} 
                       onChange={(event) => setUrlparam(event.target.value)} /></td>
          </tr>
          <tr>
            <td align="right" valign="top"><label>リクエストデータ: </label></td>
            <td valign="top"><textarea rows={rowTextarea} cols={colsTextarea} id="reqdata" name="reqdata" value={reqdata}
                       onChange={(event) => setReqdata(event.target.value)} /></td>
          </tr>
        </tbody>
      </table>
      <br/>
      <button onClick={doRequest}>実行</button>
      <br/>
      <label>実行結果: </label>
      <br/>
      <p>{result}</p>
      <br/>

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
  const isLoggedin = await vtecxnext.isLoggedin(context.req)

  const props: Props = {
    isLoggedin: String(isLoggedin)
  }
  console.log(`[getServerSideProps] props.isLoggedin=${props.isLoggedin}`)

  return {
    props: props,
  }
}

export default HomePage

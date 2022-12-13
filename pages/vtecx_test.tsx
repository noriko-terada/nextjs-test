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
      label: 'uid2 (run twice) (/d)',
      value: 'uid2',
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
      label: 'post entry (リクエストデータ、[URLパラメータ:uri={親キー}])',
      value: 'postentry',
    },
    {
      label: 'put entry (リクエストデータ)',
      value: 'putentry',
    },
    {
      label: 'delete entry (URLパラメータ:uri={キー}[&r={リビジョン}])',
      value: 'deleteentry',
    },
    {
      label: 'delete folder (URLパラメータ:uri={親キー})',
      value: 'deletefolder',
    },
    {
      label: 'allocids (URLパラメータ:uri={キー}&num={採番数})',
      value: 'allocids',
    },
    {
      label: 'addids (URLパラメータ:uri={キー}&num={加算数})',
      value: 'addids',
    },
    {
      label: 'getids (URLパラメータ:uri={キー})',
      value: 'getids',
    },
    {
      label: 'setids (URLパラメータ:uri={キー}&num={加算設定数})',
      value: 'setids',
    },
    {
      label: 'rangeids (URLパラメータ:uri={キー}&range={加算枠})',
      value: 'rangeids',
    },
    {
      label: 'getrangeids (URLパラメータ:uri={キー})',
      value: 'getrangeids',
    },
    {
      label: 'get session feed (URLパラメータ:name={名前})',
      value: 'session_get_feed',
    },
    {
      label: 'get session entry (URLパラメータ:name={名前})',
      value: 'session_get_entry',
    },
    {
      label: 'get session string (URLパラメータ:name={名前})',
      value: 'session_get_string',
    },
    {
      label: 'get session long (URLパラメータ:name={名前})',
      value: 'session_get_long',
    },
    {
      label: 'set session feed (リクエストデータ、URLパラメータ:name={名前})',
      value: 'session_put_feed',
    },
    {
      label: 'set session entry (リクエストデータ、URLパラメータ:name={名前})',
      value: 'session_put_entry',
    },
    {
      label: 'set session string (URLパラメータ:name={名前}&val={値})',
      value: 'session_put_string',
    },
    {
      label: 'set session long (URLパラメータ:name={名前}&val={数値})',
      value: 'session_put_long',
    },
    {
      label: 'increment session (URLパラメータ:name={名前}&val={数値})',
      value: 'session_put_incr',
    },
    {
      label: 'delete session feed (URLパラメータ:name={名前})',
      value: 'session_delete_feed',
    },
    {
      label: 'delete session entry (URLパラメータ:name={名前})',
      value: 'session_delete_entry',
    },
    {
      label: 'delete session string (URLパラメータ:name={名前})',
      value: 'session_delete_string',
    },
    {
      label: 'delete session long (URLパラメータ:name={名前})',
      value: 'session_delete_long',
    },
    {
      label: 'pagination (URLパラメータ:uri={キー}[&検索条件]&_pagination={ページ範囲})',
      value: 'paging_pagination',
    },
    {
      label: 'get page (URLパラメータ:uri={キー}[&検索条件]&n={ページ番号})',
      value: 'paging_getpage',
    },
    {
      label: 'post bigquery (リクエストデータ、URLパラメータ:[_async])',
      value: 'bigquery_post',
    },
    {
      label: 'delete bigquery (リクエストデータ、URLパラメータ:[_async])',
      value: 'bigquery_delete',
    },
    {
      label: 'select bigquery (リクエストデータ、URLパラメータ:[_csv])',
      value: 'bigquery_select',
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
   * @param additionalParam 追加パラメータ
   * @returns レスポンスJSON
   */
  const request = async (method:string, apiAction:string, body?:any, additionalParam?:string) => {
    console.log('[request] start.')
    const requestInit:RequestInit = {
      body: body,
      method: method,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  
    const response = await fetch(`api/${apiAction}?${urlparam}${urlparam ? '&' : ''}${additionalParam}`, requestInit)

    console.log(`[request] response. ${response}`)
    const status = response.status
    let data
    if (status === 204) {
      data = null
    } else {
      data = await response.json()
    }
    console.log(data)
    return data
  }
   
  const doRequest = async () => {
    setResult('')
    console.log(`[doRequest] start. action=${action}`)
    // selectの値を取得
    let method
    let body
    let apiAction
    let additionalParam
    if (action === 'uid' || action === 'uid2' || action === 'whoami' || 
        action === 'isloggedin' || action === 'logout' || 
        action === 'getentry' || action === 'getfeed' || action === 'getcount' ||
        action === 'allocids' || action === 'getids' || action === 'getrangeids') {
      method = 'GET'
      apiAction = action
    } else if (action === 'log' || action === 'postentry') {
      method = 'POST'
      body = reqdata
      apiAction = action
    } else if (action === 'putentry' || action === 'addids' || action === 'setids' || 
        action === 'rangeids') {
      method = 'PUT'
      body = reqdata
      apiAction = action
    } else if (action === 'deleteentry' || action === 'deletefolder') {
      method = 'DELETE'
      apiAction = action
    } else if (action.startsWith('session_')) {
      const tmpAction = action.substring(8)
      console.log(`[request] 'session_' + '${tmpAction}'`)
      const idx = tmpAction.indexOf('_')
      method = tmpAction.substring(0, idx)
      additionalParam = `type=${tmpAction.substring(idx + 1)}`
      console.log(`[request] method=${method} additionalParam=${additionalParam}`)
      if (method) {
        apiAction = 'session'
        if (method === 'put') {
          body = reqdata
        }
      }
    } else if (action.startsWith('paging_')) {
      method = 'GET'
      apiAction = 'paging'
    }

    if (method != null && apiAction != null) {
      const data = await request(method, apiAction, body, additionalParam)
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
  //console.log(`[HomePage] props.isLoggedin=${props.isLoggedin}`)

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
  const isLoggedin = await vtecxnext.isLoggedin(context.req, context.res)

  const props: Props = {
    isLoggedin: String(isLoggedin)
  }
  console.log(`[getServerSideProps] props.isLoggedin=${props.isLoggedin}`)

  return {
    props: props,
  }
}

export default HomePage

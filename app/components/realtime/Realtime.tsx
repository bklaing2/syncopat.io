import { useFetcher} from "@remix-run/react";
import type { PropsWithChildren } from "react";
import { useRef, useEffect, useState } from "react";


export interface Props {
  name?: string
  value: string
  action?: string
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete'
}

export default function Realtime ({ name, value, action, method = 'patch', children }: PropsWithChildren<Props>) {

  const fetcher = useFetcher();
  const input = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [ selection, setSelection ] = useState({ start: 0, end: 0 })

  value = fetcher.formData?.get(name || '') as string ?? value
  

  useEffect (() => {
    input.current?.setSelectionRange(selection.start, selection.end)
  }, [input, selection.end, selection.start, value])


  function fixSelection (e: any) {
    setSelection({ start: e.target.selectionStart, end: e.target.selectionEnd })
  }

  
  return <fetcher.Form
    action={action}
    method={method}
    className="ignore"
  >
    { children }
  </fetcher.Form>
}
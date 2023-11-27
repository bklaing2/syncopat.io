import { useFetcher} from "@remix-run/react";
import { useRef, useEffect, useState } from "react";


export interface Props {
  name?: string
  placeholder?: string
  value: string
  action?: string
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete'
  disabled?: boolean
  className?: string
}

export default function Input (Props: Props) {
  const { method = 'patch', disabled = true, ...props } = Props

  const fetcher = useFetcher();
  const input = useRef<HTMLInputElement>(null)
  const [ selection, setSelection ] = useState({ start: 0, end: 0 })

  const value = fetcher.formData?.get(props.name || '') as string ?? props.value
  

  useEffect (() => {
    if (!input.current) return
    if (document.activeElement !== input.current) return

    input.current.setSelectionRange(selection.start, selection.end)
  }, [input, selection.end, selection.start, value])


  function fixSelection (e: any) {
    setSelection({ start: e.target.selectionStart, end: e.target.selectionEnd })
  }

  
  return <fetcher.Form
    action={props.action}
    method={method}
    className="ignore"
  >
    <input
      ref={input}
      type="text"
      name={props.name}
      placeholder={props.placeholder}
      value={value}
      disabled={disabled}
      className={props.className}
      onChange={(e) => {
        fixSelection(e)
        props.action && fetcher.submit(e.currentTarget.form, { action: props.action, method: method })
      }}
      onClick={fixSelection}
    />
  </fetcher.Form>
}
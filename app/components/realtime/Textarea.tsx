import { useFetcher} from "@remix-run/react";
import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";


export interface Props {
  name?: string
  placeholder?: string
  value: string
  action?: string
  method?: 'get' | 'post' | 'patch' | 'put' | 'delete'
  collapsed?: boolean
  disabled?: boolean
  onKeydown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  className?: string
}


export default function Textarea (Props: Props) {
  const { method = 'patch', collapsed = false, disabled = true, ...props } = Props

  const fetcher = useFetcher();
  let input = useRef<HTMLTextAreaElement>(null)
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
    <TextareaAutosize
      ref={input}
      name="content"
      className={props.className}
      value={value}
      placeholder="Add lyrics..."
      hidden={collapsed}
      disabled={disabled}
      onChange={e => {
        fixSelection(e)
        props.action && fetcher.submit(e.currentTarget.form, { action: props.action, method: method })
      }}
      onClick={fixSelection}
      onKeyDown={props.onKeydown}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  </fetcher.Form>
}
import type { PropsWithChildren } from "react";


interface Props { className?: string }

export default function ListItem ({ className, children }: PropsWithChildren<Props>) {
  return <li className={className}>{ children }</li>
}
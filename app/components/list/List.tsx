import type { PropsWithChildren } from "react";
import styles from "./styles.module.css";

interface Props { className?: string }

export default function List ({ className = '', children }: PropsWithChildren<Props>) {
  return <ul className={`${styles.list} ${className}`}>{children}</ul>
}
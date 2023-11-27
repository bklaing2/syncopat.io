import { Form, useNavigate } from "@remix-run/react";
import { useEffect, useRef, type PropsWithChildren } from "react";

import styles from "./styles.module.css";
import Input, { type Props as InputProps } from "../realtime/Input";


interface Props {
  titleProps: InputProps;
  subtitle: string;
  closeAction?: string;
  deleteAction?: string;
  className?: string;
}


export default function Modal ({ titleProps, subtitle, closeAction, deleteAction, className, children }: PropsWithChildren<Props>) {
  const navigate = useNavigate()
  const modal = useRef<HTMLDialogElement>(null)

  useEffect(() => modal.current?.showModal(), [ modal ])

    
  return (
    <dialog
      ref={modal}
      className={styles.modal}
      onClick={() => navigate(closeAction || '..')}
      onClose={() => navigate(closeAction || '..')}
    >
      <div className={styles.layout} onClick={e => e.stopPropagation()}>
        <p className={styles.subtitle}>{subtitle}</p>
        <button className={`${styles.button} ${styles.back}`} onClick={() => navigate(-1)}>←</button>
        <h3 className={styles.title}>
          <Input {...titleProps} className={`${styles.input} ${titleProps.className}`} />
        </h3>
         
        <div className={`${styles.children} ${className}`}>
          {children}
        </div>

        { deleteAction &&
          <Form action={deleteAction} method="delete">
              <button className={`${styles.button} ${styles.delete}`} type="submit">Delete</button>
          </Form>
        }

        <button className={`${styles.button} ${styles.close}`} onClick={() => navigate(closeAction || '..')}>Close</button>
      </div>
    </dialog>
  );
}

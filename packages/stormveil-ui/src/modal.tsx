import React, { useEffect, useRef } from "react";
import styles from "./modal.css";

interface Props {
    children: React.ReactNode;
    onHide: () => void;
}

export default function Modal(props: Props) {
    const modal = useRef<HTMLDivElement>(null);

    const listener = (event: MouseEvent) => {
        const target = event.target;
        if (target === null) {
            return;
        }

        const element = modal.current;
        if (element === null) {
            return;
        }

        if (element.contains(target as Node)) {
            return;
        }

        props.onHide();
    };

    useEffect(() => {
        window.addEventListener("click", listener);
        return () => window.removeEventListener("click", listener);
    });

    return (
        <div className={styles.container} ref={modal}>
            {props.children}
        </div>
    );
}

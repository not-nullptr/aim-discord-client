import { useEffect, useRef } from "react";

export default function IconButton(props: {
    name: string;
    style?: React.CSSProperties;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
    const imgRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (!imgRef.current) return;
        (async () => {
            const img = await import(`../img/icons/${props.name}/regular.png`);
            imgRef.current!.src = img.default;
            const imgHover = await import(
                `../img/icons/${props.name}/hover.png`
            );
            imgRef.current!.onmouseenter = () => {
                imgRef.current!.src = imgHover.default;
            };
            imgRef.current!.onmouseleave = () => {
                imgRef.current!.src = img.default;
            };
            const imgPressed = await import(
                `../img/icons/${props.name}/pressed.png`
            );
            imgRef.current!.onmousedown = () => {
                imgRef.current!.src = imgPressed.default;
                document.querySelectorAll(".dotted").forEach((el) => {
                    el.classList.remove("dotted");
                });
                imgRef.current!.classList.add("dotted");
            };
            imgRef.current!.onmouseup = () => {
                imgRef.current!.src = imgHover.default;
                imgRef.current!.classList.remove("dotted");
            };
        })();
    }, []);
    return (
        <div
            style={props.style}
            className={`icon-button ${props.className || ""}`}
            onClick={props.onClick}
        >
            <img ref={imgRef} />
        </div>
    );
}

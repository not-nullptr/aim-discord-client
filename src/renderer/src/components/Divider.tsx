export default function Divider(props: {
    style?: React.CSSProperties
}) {
    return (
        <div style={props.style} className="divider">
            <div />
            <div />
        </div>
    )
}
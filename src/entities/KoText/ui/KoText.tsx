interface KoTextProps {
    data : string | undefined;
}

const KoText = ({ data } : KoTextProps ) => {

    return (
        <span style={{ fontSize : '14px' }}>{data ?? ''}</span>
    )
}

export { KoText };
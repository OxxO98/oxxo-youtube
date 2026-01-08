import React from 'react';

interface AutoLengthInputProps {
    children : React.ReactElement<HTMLInputElement>;
}

export const AutoLengthInput = ({ children } : AutoLengthInputProps) => {
    const length = children?.props?.value !== undefined ? children?.props.value.length : 0;
    const inputWithProps = React.cloneElement( children, {
        className : `input dynamic-${length}`
    })

    return(
        <>
            {inputWithProps}
        </>
    )
}
import { useContext } from 'react';
import { useNavigate } from "react-router-dom";

//Context
import { VideoContext } from 'shared/contexts/VideoContext';

//entities
import { ComplexText } from 'entities/ComplexText/index';

//CSS@antd
import { Card } from 'antd'

interface TangochouRepresentiveProps {
    tId : tId;
    hyouki : string;
    yomi : string;
    imi : string[];
}

export const TangochouRepresentive = ({ tId, hyouki, yomi, imi } : TangochouRepresentiveProps ) => {

    //Context
    const { videoId } = useContext(VideoContext);

    //Hook
    const navigate = useNavigate();

    //Handle
    const handleClick = () => {
        navigate(`/video/${videoId}/tangochou/tango/${tId}`);
    }

    return(
        <>
            <Card
                onClick={handleClick} style={{ height : '100%' }} styles={{ body : { padding : '24px 8px' } }} hoverable
            >
                <Card.Meta
                    title={
                        <ComplexText bId={tId} data={hyouki} ruby={yomi} offset={0} key={tId}/>
                    }
                    description={
                    <>
                    {
                        imi && imi.length !== 0 &&
                        <>{imi.join(',')}</>
                    }
                    </>
                    }
                />
            </Card>
        </>
    );
}
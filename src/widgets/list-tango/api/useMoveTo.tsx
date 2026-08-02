
import { useNavigate } from "react-router-dom";

export const useMoveTo = () => {
    const navigate = useNavigate();
    
    const handleToTango = (tId: string, videoId: string) => {
        navigate(`/video/${videoId}/tangochou/tango/${tId}`);
    }
    return { handleToTango }
}
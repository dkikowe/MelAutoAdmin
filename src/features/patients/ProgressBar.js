import { LinearProgress } from "@mui/material";

const ProgressBar = ({assigned}) => {
    const calculateProgress = (assignedProcedures) => {
        const totalProcedures = Object.keys(assignedProcedures).length;
        const completedProcedures = Object.values(assignedProcedures).filter(date => date !== null).length;
        return (completedProcedures / totalProcedures) * 100;
    };


    return <LinearProgress variant="determinate" color="success" value={calculateProgress(assigned)} sx={{ marginBottom: 2 }} />;
}

export default ProgressBar;
import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";

const ZoomToVertex = ({ targetVertex }: {
    targetVertex?: string;
}): React.JSX.Element => {
    const sigma = useSigma();

    useEffect(() => {
        if (!targetVertex) return;
        const nodeDisplayData = sigma.getNodeDisplayData(targetVertex);
        if (nodeDisplayData) {
            sigma.getGraph().setNodeAttribute(targetVertex, "highlighted", true);
            sigma.getCamera().animate(
                { ...nodeDisplayData, ratio: 0.05 },
                { duration: 600 },
            )
        }

        return () => {
            sigma.getGraph().setNodeAttribute(targetVertex, "highlighted", false);
        };
    }, [targetVertex])

    return <></>;
}

export default ZoomToVertex;
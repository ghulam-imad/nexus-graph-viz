import React, { FC, useEffect, useRef, useState } from 'react';
import "./NexusGraph.css";
import {
    SigmaContainer,
    ControlsContainer,
    ZoomControl,
    FullScreenControl,
} from "@react-sigma/core";
import {
    AiOutlineZoomIn,
    AiOutlineZoomOut,
    AiOutlineFullscreenExit,
    AiOutlineFullscreen,
} from "react-icons/ai";
import {
    MdFilterCenterFocus,
    MdOutlineFilterAlt,
} from "react-icons/md";
import "@react-sigma/core/lib/react-sigma.min.css"
import { drawEdgeLabel, drawHover, drawLabel } from "./canvas_helper"
import { IGraphData } from './types';
import LoadGraph from './LoadGraph';
import GraphEvents from './EventHandler';
import FilterPanel from './FilterPanel';
import ZoomToVertex from './ZoomToVertex';
import { ForceAtlas2 } from './GraphLayout';

const NexusGraph = ({ graph, vertexSelection, colorTemplate }: {
    graph: IGraphData[],
    vertexSelection?: string,
    colorTemplate?: { [key: string]: string },
}): React.JSX.Element => {
    const sigma_container = useRef<any>(null);
    const [activeNode, setActiveNode] = useState<string[]>([]);
    const [layoutState, setLayoutState] = useState<'start' | 'stop'>('start');

    useEffect(() => {
        if (vertexSelection) {
            setActiveNode([...activeNode, vertexSelection])
        }
    }, [vertexSelection])
    return (
        <>
            <SigmaContainer
                ref={sigma_container}
                style={{ height: "100%", width: "100%" }}
                settings={{
                    renderEdgeLabels: true,
                    labelFont: "Lato, sans-serif",
                    labelSize: 7,
                    labelRenderedSizeThreshold: 7,
                    labelDensity: 0.07,
                    labelGridCellSize: 100,
                    edgeLabelFont: "Lato, sans-serif",
                    edgeLabelColor: { color: "#555" },
                    edgeLabelSize: 5,
                    zIndex: true,
                    defaultDrawNodeLabel: drawLabel,
                    defaultDrawNodeHover: drawHover,
                    defaultDrawEdgeLabel: drawEdgeLabel,
                }}>
                <LoadGraph data={graph} colorTemplate={colorTemplate} />
                <GraphEvents
                    activeNode={activeNode}
                    setActiveNode={setActiveNode}
                    stopLayout={() => {
                        setLayoutState("stop");
                    }}
                />
                <ControlsContainer position={"top-right"}>
                    <ZoomControl>
                        <AiOutlineZoomIn />
                        <AiOutlineZoomOut />
                        <MdFilterCenterFocus />
                    </ZoomControl>
                    <ZoomToVertex targetVertex={vertexSelection} />
                    <FullScreenControl>
                        <AiOutlineFullscreen />
                        <AiOutlineFullscreenExit />
                    </FullScreenControl>
                    <ForceAtlas2
                        state={layoutState}
                        onStart={() => {
                            setLayoutState("start");
                        }}
                        onStop={() => {
                            setLayoutState("stop");
                        }}
                    />
                    <FilterPanel>
                        <MdOutlineFilterAlt />
                    </FilterPanel>
                </ControlsContainer>
            </SigmaContainer>
        </>
    )
}

export default NexusGraph;
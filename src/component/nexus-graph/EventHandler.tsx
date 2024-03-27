import {
    useRegisterEvents,
    useSigma,
} from "@react-sigma/core";
import React, { useEffect, useRef, useState } from "react";

const GraphEvents = ({ activeNode, setActiveNode, stopLayout }: {
    activeNode: string[],
    setActiveNode: (val: string[]) => void
    stopLayout?: () => void
}): React.JSX.Element => {
    const registerEvents = useRegisterEvents();
    const sigma = useSigma();
    const [draggedNode, setDraggedNode] = useState<string | null>(null);

    const distance = useRef(0);
    const setDistance = (d: number): void => {
        distance.current = d;
    }
    const [isTracking, setIsTrackingState] = useState(false);
    const setIsTracking = (val: boolean): void => {
        setIsTrackingState(val);
        if (val) {
            setDistance(0);
        }
    }
    const prevPosition = useRef({ x: null, y: null });

    useEffect(() => {
        // Register the events
        registerEvents({
            downNode: (e: any) => {
                setIsTracking(true);
                setDraggedNode(e.node);
                sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
            },
            mouseup: (e: any) => {
                setIsTracking(false);
                if (draggedNode) {
                    setDraggedNode(null);
                    sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
                }
            },
            mousedown: (e: any) => {
                setIsTracking(true);
                // Disable the autoscale at the first down interaction
                if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
            },
            mousemove: (e: any) => {
                if (isTracking) {
                    const currentPosition = { x: e.x, y: e.y };
                    if (prevPosition.current.x && prevPosition.current.y) {
                        const deltaX = Math.abs(currentPosition.x - prevPosition.current.x);
                        const deltaY = Math.abs(currentPosition.y - prevPosition.current.y);
                        const newDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        setDistance(distance.current + newDistance);
                    }
                    prevPosition.current = currentPosition;
                }

                if (draggedNode) {

                    if (stopLayout) stopLayout();

                    // Get new position of node
                    const pos = sigma.viewportToGraph(e);
                    sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
                    sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

                    // Prevent sigma to move camera:
                    e.preventSigmaDefault();
                    e.original.preventDefault();
                    e.original.stopPropagation();
                }
            },
            touchup: (e: any) => {
                setIsTracking(false);
                if (draggedNode) {
                    setDraggedNode(null);
                    sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
                }
            },
            touchdown: (e: any) => {
                setIsTracking(true);
                // Disable the autoscale at the first down interaction
                if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
            },
            touchmove: (e: any) => {
                if (draggedNode) {

                    if (stopLayout) stopLayout();
                    
                    // Get new position of node
                    const pos = sigma.viewportToGraph(e);
                    sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
                    sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

                    // Prevent sigma to move camera:
                    e.preventSigmaDefault();
                    e.original.preventDefault();
                    e.original.stopPropagation();
                }
            },
            clickStage: (e: any) => {
                if (activeNode.length > 0 && !e.event.original.ctrlKey) {
                    setActiveNode([]);
                    activeNode.forEach((n) => {
                        sigma.getGraph().removeNodeAttribute(n, "highlighted");
                    })
                }
            },
            clickNode: (e: any) => {
                const moveThreshold = 10;
                if (distance.current > moveThreshold && !activeNode?.includes(e.node)) {
                    return false;
                }
                if (e.event.original.ctrlKey) {
                    if (!activeNode?.includes(e.node)) {
                        setActiveNode([...activeNode, e.node]);
                    } else if (distance.current <= moveThreshold) {
                        const newActive = activeNode;
                        newActive.splice(newActive.indexOf(e.node), 1);
                        setActiveNode(newActive);
                        sigma.getGraph().removeNodeAttribute(e.node, "highlighted");
                    }
                } else {
                    if (distance.current <= moveThreshold) {
                        activeNode.forEach((n) => {
                            sigma.getGraph().removeNodeAttribute(n, "highlighted");
                        })
                        setActiveNode([e.node]);
                    }
                }
            }
        });
        activeNode.forEach((n) => {
            sigma.getGraph().setNodeAttribute(n, "highlighted", true);
        })
    }, [registerEvents, sigma, draggedNode, activeNode]);

    return <></>;
};

export default GraphEvents;
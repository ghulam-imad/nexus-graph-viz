import { useSigma } from "@react-sigma/core";
import { useWorkerLayoutForce } from "@react-sigma/layout-force";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useEffect, useRef, useState } from "react";
import { PiGraph } from "react-icons/pi";
import "./GraphLayout.css";

export const ForceLayout = (): React.JSX.Element => {
    const sigma = useSigma();

    const { start, kill } = useWorkerLayoutForce({
        isNodeFixed: (_, attr) => attr.highlighted,
        settings: {
            attraction: 0.001,
            repulsion: 0.001,
            gravity: 0.00001,
            inertia: 0.5,
            maxMove: 200
        }
    })

    useEffect(() => {
        start();
        return () => {
            kill();
        };
    }, [start, kill]);
    return <></>
}

export const ForceAtlas2 = ({ state, onStart, onStop }: {
    state: "start" | "stop",
    onStart?: () => void,
    onStop?: () => void
}): React.JSX.Element => {
    const [ layoutState, setLayoutState ] = useState<"start" | "stop">(state);
    const inferSetting = forceAtlas2.inferSettings(500);
    const { start, stop, kill, isRunning } = useWorkerLayoutForceAtlas2({
        settings: inferSetting
    });

    const iconRef = useRef<HTMLDivElement | null>(null);

    const toggleRun = (): void => {
        setLayoutState(isRunning?"stop":"start");
    }

    function runLayout(timeout?: number) {
        start();
        timeout && setTimeout(stopLayout, timeout);
        if (iconRef.current) {
            iconRef.current.style.animation = 'rotate 2s linear infinite';
        }
        onStart && onStart();
    }

    function stopLayout() {
        stop();
        if (iconRef.current) {
            iconRef.current.style.animation = '';
        }
        onStop && onStop();
    }

    useEffect(() => {
        if (layoutState == 'start'){
            runLayout(1000);
        } else {
            stopLayout();
        }
    },[start, stop, layoutState])

    useEffect(() => {
        setLayoutState(state);
    }, [state])

    return (
        <div className='react-sigma-control'>
            <button title="Run Graph Layout" onClick={() => { toggleRun() }}>
                <div ref={iconRef}>
                    <PiGraph />
                </div>
            </button>
        </div>
    )
}
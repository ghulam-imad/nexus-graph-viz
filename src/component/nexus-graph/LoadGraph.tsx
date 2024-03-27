import { useLoadGraph } from "@react-sigma/core";
import { IGraphData } from "./types";
import { useEffect } from "react";
import Graph from "graphology";

const colorHash = (str: string): string => {
    const djb2 = (str: string): number => {
        var hash = 5381;
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
        }
        return hash;
    }
    const hash = djb2(str);
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return "#" + ("0" + r.toString(16)).substring(-2) + ("0" + g.toString(16)).substring(-2) + ("0" + b.toString(16)).substring(-2);
}

const LoadGraph = ({ data, colorTemplate }: {
    data: IGraphData[];
    colorTemplate?: { [key: string]: string };
}): React.JSX.Element => {

    const loadGraph = useLoadGraph();

    useEffect(() => {
        const graph = new Graph();
        data.forEach((p) => {
            // process vertices
            p.vertices.forEach((v) => {
                const { _id, _key, ...attr } = v;
                const typ = _id.split("/")[0];
                let color = "#aaaaaa";
                if (colorTemplate && typ in colorTemplate) {
                    color = colorTemplate[typ]
                } else {
                    color = colorHash(typ);
                }

                graph.mergeNode(_id, {
                    nx_attr: attr,
                    label: _key,
                    color: color,
                    size: attr.size?attr.size:5,
                    x: Math.random(),
                    y: Math.random(),
                    vtype: typ
                });
            })

            // process edges
            p.edges.forEach((e) => {
                const { _id, _key, _from, _to, ...attr } = e;
                const typ = _id.split("/")[0];
                let color = "#aaaaaa";
                if (colorTemplate && typ in colorTemplate) {
                    color = colorTemplate[typ]
                } else {
                    color = colorHash(typ);
                }

                graph.mergeEdgeWithKey(_id, _from, _to, {
                    label: typ,
                    color: color,
                    nx_attr: attr
                });
            })
        })

        loadGraph(graph);
    }, [loadGraph]);

    return <></>;
};

export default LoadGraph;
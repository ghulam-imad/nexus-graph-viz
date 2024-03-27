interface IVertex {
    _id: string,
    _key?: string,
    _rev?: string,
    [key: string]: string | number | undefined,
}

interface IEdge {
    _id: string,
    _from: string,
    _to: string,
    _key?: string,
    _rev?: string,
    [key: string]: string | number | undefined,
}

export interface IGraphData {
    vertices: IVertex[],
    edges: IEdge[],
    weights?: number[],
}
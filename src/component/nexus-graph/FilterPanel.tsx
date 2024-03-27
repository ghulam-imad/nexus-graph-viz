import { useSigma } from "@react-sigma/core";
import React, { FC, useEffect, useRef, useState } from "react";
import date from 'date-and-time';
import { ECharts, EChartsOption, init } from "echarts";
import { Attributes } from "graphology-types";
import hexToRgba from "hex-to-rgba";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { MdOutlineClose } from "react-icons/md";
import "./FilterPanel.css";

const FilterPanel = ({ showOnLoad, children }: {
    showOnLoad?: boolean;
    children: React.JSX.Element;
}): React.JSX.Element => {
    const chartRef = useRef<HTMLDivElement>(null);
    const sigma = useSigma();
    const [filterActive, setFilterActive] = useState<boolean>(showOnLoad || false);

    const [xaxis, setXAxis] = useState<string>("transaction_ts");
    const [yaxis, setYAxis] = useState<string>("amount");

    function formatData(x: string, y: string): {
        columns: any[],
        data: number[]
    } {
        let group_data: { [key: string]: number[] } = {}

        sigma.getGraph().forEachNode((node: string, attr: any) => {
            if (x in attr.nx_attr && y in attr.nx_attr) {
                let key = date.format(new Date(attr.nx_attr[x]), "YYYY-MM")

                let val = attr.nx_attr[y];
                if (!(key in group_data)) {
                    group_data[key] = []
                }
                group_data[key].push(val)
            }
        })

        let cols: any[] = [];
        let vals: number[] = [];

        const sorted_keys = Object.keys(group_data).sort().forEach((key) => {
            const agg = group_data[key].reduce((prev, curr) => {
                return prev + curr;
            }, 0);
            cols.push(key);
            vals.push(agg);
        })

        /* console.log(group_data) */
        return {
            columns: cols,
            data: vals
        }
    }

    useEffect(() => {
        let chart: ECharts = init(chartRef.current);

        function resizeChart() {
            chart?.resize();
        }
        window.addEventListener("resize", resizeChart);

        const { columns, data } = formatData(xaxis, yaxis);

        var option: EChartsOption = {
            tooltip: {
                trigger: 'axis',
            },
            xAxis: {
                data: columns,
                name: "transaction_ts",
                nameLocation: "middle",
                nameGap: 30,
                axisTick: {
                    alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    inside: false
                },
                scale: true,
                splitArea: {
                    show: true
                },
            },
            series: [
                {
                    data: data,
                    type: 'bar'
                }
            ],
            grid: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 30,
                containLabel: true,
            },
            brush: {
                toolbox: ['lineX', 'keep', 'clear'],
                xAxisIndex: 'all',
                brushLink: 'all',
                brushType: 'lineX',
                outOfBrush: {
                    colorAlpha: 0.1
                }
            },
        };

        option && chart.setOption(option);
        chart.on('brush', (selection: any) => {
            let xval_selected: any[] = [];
            selection.areas?.forEach((el: any) => {
                let [start, end] = el.coordRange;
                xval_selected = xval_selected.concat(columns.slice(start, end + 1));
            })

            sigma.getGraph().forEachNode((node: string, attr: Attributes) => {
                let color: string;
                if ('orig_color' in attr) {
                    color = attr['orig_color']
                } else {
                    color = attr['color'];
                    sigma.getGraph().setNodeAttribute(node, 'orig_color', attr['color']);
                }
                let res_color = hexToRgba(color, 0.5);
                if (xval_selected.length > 0) {
                    if (xaxis in attr.nx_attr) {
                        const val: string = attr.nx_attr[xaxis] as string;
                        xval_selected.forEach((q) => {
                            if (val.startsWith(q)) {
                                res_color = color;
                            }
                        })
                    }
                } else {
                    res_color = color;
                }
                sigma.getGraph().setNodeAttribute(node, 'color', res_color);
            })
        })

        return () => {
            chart?.dispose();
            window.removeEventListener("resize", resizeChart);
        };
    }, [])

    return (
        <>
            <div className='react-sigma-control'>
                <button title="Visual Highlight Filter" onClick={() => setFilterActive(!filterActive)}>
                    {children}
                </button>
            </div>
            <div className={`filter-panel ${filterActive && 'filter-active'}`}>
                <div className='filter-title'>
                    Visual Highlight
                    <button className='filter-close-btn'>
                        <MdOutlineClose onClick={() => setFilterActive(false)} />
                    </button>
                </div>
                <div className='filter-body'>
                    <div>
                        <div className='filter-y-selector'>
                            <div>{yaxis}</div>
                            <div><HiOutlinePencilAlt /></div>
                        </div>
                        <div ref={chartRef} style={{ width: "100%", height: "230px", padding: "0px" }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default FilterPanel;
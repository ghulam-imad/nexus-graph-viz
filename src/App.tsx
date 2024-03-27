import React, { useState } from 'react';
import './App.css';
import NexusGraph from './component/nexus-graph/NexusGraph';
import testData from "./testData.json";
import { IGraphData } from './component/nexus-graph/types';

function App() {
  const data: IGraphData[] = testData;
  const [vSelect, setVSelect] = useState<string>()

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

  const colorTemplate = {
    "Transaction": "#fdba74",
    "Account": "#67e8f9",
    "Customer": "#65a30d",
    "send": "#d6d3d1",
    "receive": "#d6d3d1",
  }

  const randomColor = {
    "Transaction": colorHash("Transaction"),
    "Account": colorHash("Account"),
    "Customer": colorHash("Customer"),
    "send": colorHash("send"),
    "receive": colorHash("receive"),
  }

  const allAccount: (string | undefined)[] = [];
  data.forEach((el) => {
    el.vertices.forEach((v) => {
      const typ = v._id.split("/")[0];
      if (typ == "Account" && !allAccount.includes(v._key)) {
        allAccount.push(v._key);
      }
    })
  })

  return (
    <>
      <h1>Graph Viz</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
        <div style={{ height: "600px", overflow: "auto" }}>
          <h2>List of Accounts</h2>
          <table style={{ width: "100%" }}>
            <thead>
              <tr style={{ fontWeight: "bold" }}>
                <td style={{ borderBottom: "1px solid #555" }}>Account No.</td>
                <td style={{ borderBottom: "1px solid #555" }}>Show</td>
              </tr>
            </thead>
            <tbody>
              {allAccount.map((acc, idx) => {
                return (
                  <tr key={idx}>
                    <td style={{ borderBottom: "1px solid #555" }}>{acc}</td>
                    <td style={{ borderBottom: "1px solid #555" }}>
                      <button onClick={() => { setVSelect("Account/" + acc) }}>
                        &gt;&gt;
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className='graph-container'>
          <NexusGraph
            graph={data}
            vertexSelection={vSelect}
            colorTemplate={randomColor}
          />
        </div>
      </div>
    </>
  );
}

export default App;

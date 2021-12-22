import React, {useState} from 'react';
import { sample } from "./sample";

const RE_SKILL_SEARCH = new RegExp('You use (.*)  Success!')

const constructMacroBlocks = (lines: string[]) => {
  const lineBlocks = []
  const pages = Math.ceil(lines.length / 15 )
  for (let i = 0; i < pages; i++) {
    lineBlocks.push(
      lines
        .map(line => `/ac "${line}" <wait.3>`)
        .slice(i*15, 15+i*15)
    )
  }
  return lineBlocks
}

const highlightPasteContent = (pasteData: string, skillNames: string[]) => {
  const uniques = Array.from(new Set(skillNames))

  return pasteData.split('\n').map(line => {
    for (const unique of uniques) {
      const splat = line.split(unique)
      if (splat.length === 2) {
        return [
          splat[0],
          unique,
          splat[1]
        ]
      }
    }
    return [line]
  })
}

function App() {
  const [textContent, setTextContent] = useState('')
  const [macroBlocks, setMacroBlocks] = useState<Array<string[]>>([])
  const [highlightedText, setHighlightedText] = useState<string[][] | null>(null)

  const convertTextContentToMacro = () => {
    const skillNames = textContent
      .split('\n')
      .map(line => line.match(RE_SKILL_SEARCH))
      .filter(line => !!line)
      .map(line => line![1])
    const highlights = highlightPasteContent(textContent, skillNames)
    const blocks = constructMacroBlocks(skillNames)
    console.log(highlights)
    setHighlightedText(highlights)
    setMacroBlocks(blocks)
  }

  const copyMacroBlockToClipboard = (macroBlockIndex: number) => {
    const text = macroBlocks[macroBlockIndex].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      console.log('success')
    }).catch(() => {
      console.log('clipboard error')
    })
  }

  return (
    <div className="container mx-auto lg bg-slate-100 h-full flex flex-col">
      <header className="flex flex-col justify-center items-center shrink-0 grow-0 bg-slate-300 pb-4">
        <h1 className="text-3xl p-4">FFXIV CrafterLogToMacro</h1>
        {macroBlocks.length === 0 && (
          <p>
            <button
              className="bg-slate-500 hover:bg-slate-700 text-white py-0 px-1 font-bold rounded leading-5"
              onClick={() => setTextContent(sample)}
            >
              Click here
            </button> for an example.
          </p>
        )}
        {macroBlocks.length > 0 && (
          <p>
            <button
              className="bg-slate-500 hover:bg-slate-700 text-white py-0 px-1 font-bold rounded leading-5"
              onClick={() => window.location.reload()}
            >
              Click here
            </button> to reset.
          </p>
        )}
      </header>
      <div className="grid grid-flow-col auto-cols-fr grow h-full p-8">
        <div className="h-full w-full p-4 font-sans">
          {macroBlocks.length === 0 && (
           <textarea
             placeholder="Paste your (trial) synthesis log from the chat log here in its entirety. Then press the Convert button on the right. "
             className="h-full w-full p-2 bg-slate-100 rounded border-solid border-black border-2 border-gray-400"
             onPaste={() => {}}
             value={textContent}
             onChange={(e) => {
               setTextContent(e.target.value)
             }}
           >
           </textarea>
          )}
          {highlightedText && macroBlocks.length > 0 && (
            <div>
              <h1 className="text-lg pb-8">Analysis</h1>
              <div className="text-sm">
                {highlightedText.map((line, i) => {
                  if (line.length === 1) {
                    return <p key={i}>{line}</p>
                  }
                  if (line.length === 3) {
                    return <p key={i}>{line[0]}<em className="bg-slate-300">{line[1]}</em>{line[2]}</p>
                  }
                  return null
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-300 w-full p-4">
          {macroBlocks.length === 0 && (
            <div className="flex w-full h-full justify-center align-center items-center">
              <button
                className="h-32 w-32 bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => convertTextContentToMacro()}
              >
                Convert
              </button>
            </div>
          )}
          {macroBlocks.map((macroBlock, i) => {
            return (
              <div key={`list${i}`} className="pb-2" >
                <p className="pb-2 flex flex-row justify-between">
                  <span className="self-end">Macro {i+1}.</span>
                  <button
                    className="ml-4 bg-slate-500 hover:bg-slate-700 text-white font-bold py-1 px-1 rounded"
                    onClick={() => copyMacroBlockToClipboard(i)}
                  >
                    Copy to clipboard
                  </button>
                </p>
                <div className="mb-4 w-full p-2 bg-indigo-100 rounded border-dotted border-gray border-2 border-gray-400">

                  <pre>
                    {macroBlock.map((line, ii) => <code key={ii}>{line}</code>)}
                  </pre>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <footer className="flex h-16 bg-white">
      </footer>
    </div>
  );
}

export default App;

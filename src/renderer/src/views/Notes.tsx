import { RiFolderOpenLine, RiSearchLine } from "react-icons/ri"

const NotesView = ({ glassPanel }: { glassPanel: string }) => (
  <div className="flex-1 p-8 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
    <div className={`${glassPanel} p-3 flex items-center gap-3 mb-4`}>
      <RiSearchLine className="text-zinc-500" />
      <input
        type="text"
        placeholder="Search Neural Archives..."
        className="bg-transparent border-none outline-none text-sm text-zinc-300 w-full placeholder:text-zinc-600"
      />
    </div>
    <div className="grid grid-cols-4 gap-4">
      {['Project Alpha', 'System Logs', 'Dream Journal'].map((folder, i) => (
        <div
          key={i}
          className={`${glassPanel} h-32 p-4 flex flex-col justify-between hover:border-emerald-500/40 cursor-pointer transition-all group`}
        >
          <RiFolderOpenLine
            size={24}
            className="text-zinc-600 group-hover:text-emerald-400 transition-colors"
          />
          <div className="text-sm font-bold text-zinc-300">{folder}</div>
        </div>
      ))}
    </div>
  </div>
)

export default NotesView

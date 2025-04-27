import Update from './update.mdx'

interface UpdateModalProps {
  userUpdateVer: number;
  onClose: () => void;
}

const updateVer: number = 0;

const UpdateModal: React.FC<UpdateModalProps> = ({ userUpdateVer, onClose }) => {
  
  return (
    userUpdateVer < updateVer ? (
      <div className="animate-fadein-short bg-black/50 fixed inset-0 flex justify-center items-center z-[2000] p-10 animate-fadeIn">
        <div className="animate-fadein-med relative bg-white p-8 rounded-2xl font-serif max-w-[600px] max-h-[80vh] shadow-lg animate-slideIn flex flex-col">
          <div className="overflow-y-auto pr-2 flex-grow">
            <Update
              components={{
                p: (props) => (
                  <p {...props} className="font-secondary"/>
                ),
                h1: (props) => (
                  <h1 {...props} className="font-primary"/>
                ),
                button: (props) => (
                  <button {...props}
                    className="border-none px-4 py-2 rounded-lg font-secondary text-sm bg-[var(--color-item-background)] hover:opacity-90 transition-opacity" />
                )
              }} />
          </div>
          <div className="flex justify-center mt-5 pt-4 border-t border-gray-200">
            <button className="hover:bg-selected border-none px-4 py-2 rounded-2xl font-secondary text-lg bg-item-selected hover:opacity-90 transition-opacity" onClick={onClose}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
};

export { updateVer, UpdateModal };


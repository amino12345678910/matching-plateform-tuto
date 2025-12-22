import {Spinner} from '../ui/spinner';
import {useEffect} from 'react';

function AddServiceLoadingState() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/40 backdrop-blur-sm
        flex items-center justify-center
        pointer-events-auto
      "
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="size-14" scale={25} />
      </div>
    </div>
  );
}

export default AddServiceLoadingState;

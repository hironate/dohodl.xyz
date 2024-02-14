import { ImSpinner8 } from 'react-icons/im';
export const Spinner = () => {
  return (
    <div
      className="ml-4  spinner-border animate-spin  w-4 h-4 border-1 rounded-full"
      role="status"
    >
      <span className="visually-hidden">
        <ImSpinner8 />
      </span>
    </div>
  );
};

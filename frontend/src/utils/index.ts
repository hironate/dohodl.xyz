import { Theme, TypeOptions, toast } from "react-toastify";

export const generateTost = ({
  toastType = "default",
  message,
  theme = "light",
}: {
  toastType?: TypeOptions;
  message: string;
  theme?: Theme;
}) => {
  toast(message, {
    type: toastType,
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme,
  });
};

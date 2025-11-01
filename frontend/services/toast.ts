import Toast from "react-native-toast-message";

export const toastInfo = (message: string) => {
  Toast.show({
    type: "info",
    text1: message,
  });
};

export const toastSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
  });
};

export const toastError = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
  });
};

export const toastWarning = (message: string) => {
  Toast.show({
    type: "warning",
    text1: message,
  });
};

export const toastCustom = (message: string, type: string) => {
  Toast.show({
    type,
    text1: message,
  });
};

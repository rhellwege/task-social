import { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { HandlersErrorResponse } from "./api/Api";

export const toastInfo = (message: string) => {
  console.log(message);
  Toast.show({
    type: "info",
    text1: message,
  });
};

export const toastSuccess = (message: string) => {
  console.log(message);
  Toast.show({
    type: "success",
    text1: message,
  });
};

export const toastError = (message: string) => {
  console.error(message);
  Toast.show({
    type: "error",
    text1: message,
  });
};

export const toastAxiosError = (error: AxiosError<HandlersErrorResponse>) => {
  console.error(error);
  Toast.show({
    type: "error",
    text1: error.response?.data.error,
  });
};

export const toastWarning = (message: string) => {
  console.warn(message);
  Toast.show({
    type: "warning",
    text1: message,
  });
};

export const toastCustom = (message: string, type: string) => {
  console.log(message);
  Toast.show({
    type,
    text1: message,
  });
};

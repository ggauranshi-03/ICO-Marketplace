import "../styles/globals.css";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import { StateContextProvider } from "../Context";
export default function App({ Component, pageProps }) {
  return (
    <>
      <StateContextProvider>
        <Component {...pageProps} />
        <Toaster />
      </StateContextProvider>
    </>
  );
}

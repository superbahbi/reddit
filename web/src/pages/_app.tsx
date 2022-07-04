import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { Provider, createClient } from "urql";
import { AppProps } from "next/app";
const client = createClient({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include",
  },
});

import theme from "../theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ThemeProvider theme={theme}>
        {/* <ColorModeProvider> */}
        <CSSReset />
        <Component {...pageProps} />
        {/* </ColorModeProvider> */}
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;

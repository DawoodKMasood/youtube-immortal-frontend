'use client'

import {NextUIProvider} from "@nextui-org/system";

const NextUIThemeProvider = ({children}) => {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}

export default NextUIThemeProvider;
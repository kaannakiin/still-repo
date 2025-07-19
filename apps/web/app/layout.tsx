import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";

const primaryColor: MantineColorsTuple = [
  "#ecefff",
  "#d5dafb",
  "#a9b1f1",
  "#7a87e9",
  "#5362e1",
  "#3a4bdd",
  "#2c40dc",
  "#1f32c4",
  "#182cb0",
  "#0a259c",
];

const theme = createTheme({
  colors: {
    primary: primaryColor,
  },
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`min-h-screen min-w-screen flex flex-col w-full h-full relative`}
      >
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}

import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"ControlLattice Systems | Controls, AI & Technical Knowledge",description:"ControlLattice Systems connects controls engineering, AI, and technical knowledge for complex scientific and industrial systems.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}

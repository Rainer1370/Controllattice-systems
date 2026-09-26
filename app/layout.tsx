import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Control Lattice Systems | Engineering, AI & Technical Products",description:"Control Lattice Systems builds reliable engineering systems, trains and applies AI, develops technical products, and publishes practical knowledge.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
